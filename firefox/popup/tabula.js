/*
MIT License

Copyright (c) 2020 Philip Thomas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

//Warning: changing these will change all dependent output tables
var passchars = {
    letters: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz",
    numbers: "0123456789",
    advanced: "?,=[]_:+*'~;/.{}",
    standard: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()",
    empty: " "
};

//Initial settings, build grid:
var st = {
    'rows': 26,  
    'cols': 26,
    'charset': passchars.standard + passchars.advanced,  //Initial selection
    'blankList': generateFill(26,26,' '),
    'maskList': generateFill(26,26,'*'), 
    'charList': [],
    'highlightIds': []
};

appendGrid(st.blankList);
renderDirections();  //Inserts dropdown


function appendGrid(charList) {
    //Reset PW
    document.getElementById('password').value = '';
    var grid = buildGrid(st.rows, st.cols, charList, clicked);
    var el = document.getElementById('tabula');
    el.innerHTML = '';
    el.appendChild(grid);
}

function clicked(el,row,col,i,str) {
    var meth = document.getElementById('method');
    var method = meth.options[meth.selectedIndex].value;
    var len = document.getElementById('length');
    var length = Number(len.value);

    //Skip if grid not populated yet
    if (st.charList.length < 1) {return;}

    switch(method) {
        case 'manual':
            var ps = document.getElementById('password');
            ps.value = ps.value += el.textContent;
            st.highlightIds.push(el.id);
            if (document.getElementById('highlight').checked) {
                el.className='clicked';
            }
            break;
        case 'line':
            clearPs();
            var dir = document.getElementById('direction');
            var direction = dir.options[dir.selectedIndex].value;
            return highlightPs(lineMatrix(col,row,direction,length));
            break;
        case 'step':
            clearPs();
            var dir = document.getElementById('direction');
            var direction = dir.options[dir.selectedIndex].value;
            return highlightPs(stepMatrix(col,row,direction,length));
            break;
        case 'spiral':
            clearPs();
            return highlightPs(spiralMatrix(col,row,length));
            break;

    }
}

//source: https://stackoverflow.com/questions/9140101,
//http://jsfiddle.net/6qkdP/2/     
function buildGrid(rows, cols, charList, callback){
    var i=0;
    var grid = document.createElement('table');
    grid.className = 'grid'; 

    var alpha = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    var header = generateHeader(alpha);
    grid.appendChild(header);
    
    for (var r=0; r<rows; ++r){
        var tr = grid.appendChild(document.createElement('tr'));
        var rowList = charList[r];

        //Add the row alphabet header
        var h = document.createElement('th');
        h.innerHTML = alpha[r];
        tr.appendChild(h);

        for (var c=0; c<cols; ++c){
            var cell = tr.appendChild(document.createElement('td'));
            ++i;
            var str = rowList[c];
            cell.innerHTML = str;
            //x, y, where y is "negative"
            cell.id = 'c' + String(c) +','+ String(r);  
            cell.addEventListener('click',(function(el,r,c,i,str){
                return function(){
                    callback(el,r,c,i,str);
                }
            })(cell,r,c,i,str),false);
        }
    }
    return grid;
}

function generateHeader(alpha) {
    var header = document.createElement('thead');
    var hrow = document.createElement('tr');
    hrow.appendChild(document.createElement('th'));
    for (var j=0; j<alpha.length; j++) {
        var th = document.createElement('th');
        th.innerHTML = alpha[j];
        hrow.appendChild(th);
    }
    header.appendChild(hrow);
    return header;
}

function create() {
    var charList = generateCharacters(st.rows,st.cols,st.charset);
    st.charList = charList;  //Sets Global
    populateGrid(charList);
}

//https://stackoverflow.com/questions/5226285
//Skip animation for now, scrypt makes it look janky
function populateGrid(charList, animate=false, clear=true) {
    
    if (clear) {
        clearPs();
    }

    if (document.getElementById('mask').checked) {
        var joinedList = st.maskList.reduce(function(a, b){return a.concat(b);}, []);
    } else {
        var joinedList = charList.reduce(function(a, b){return a.concat(b);}, []);
    }
    
    var cells = Array.from(document.getElementsByTagName('td'));
    //Using requestAnimationFrame
    for (var i=0; i<cells.length; i++) {
        if (animate) {
            var num = 32;
            var endNum = joinedList[i].charCodeAt(0);
            var cell = cells[i];
            var steps = endNum - num;
            var duration = 750;  //750
            animateCell(cell,steps,duration);
        } else {
            cells[i].textContent = joinedList[i];
        }
    }

}

function animateCell(cell, steps, duration) {
    function changeCell(timestamp, cell, steps, duration){
        var timestamp = timestamp || new Date().getTime();
        var runtime = timestamp - starttime;
        var progress = runtime / duration;
        progress = Math.min(progress, 1);
        cell.textContent = String.fromCharCode(32+steps*progress);

        if (runtime < duration){ // if duration not met yet
            // Call requestAnimationFrame again with parameters
            requestAnimationFrame(function(timestamp){ 
                changeCell(timestamp, cell, steps, duration);
            });
        }
    }
    //http://www.javascriptkit.com/javatutors/requestanimationframe.shtml
    var starttime;
    requestAnimationFrame(function(timestamp){
        //if browser doesn't support requestAnimationFrame, 
        //generate our own timestamp using Date
        starttime = timestamp || new Date().getTime(); 
        changeCell(timestamp, cell, steps, duration);
    });
}

//Note, main file does not include all of sjcl, and it excludes scrypt,
//need to build yourself if you want it.  
//https://github.com/bitwiseshiftleft/sjcl/issues/315
//https://github.com/bitwiseshiftleft/sjcl/blob/master/core/scrypt.js
/** scrypt Password-Based Key-Derivation Function.
 *
 * @param {bitArray|String} password  The password.
 * @param {bitArray|String} salt      The salt.  Should have lots of entropy.
 *
 * @param {Number} [N=16384] CPU/Memory cost parameter.
 * @param {Number} [r=8]     Block size parameter.
 * @param {Number} [p=1]     Parallelization parameter.
 *
 * @param {Number} [length] The length of the derived key.  Defaults to the
 *                          output size of the hash function.
 * @param {Object} [Prff=sjcl.misc.hmac] The pseudorandom function family.
 *
 * @return {bitArray} The derived key.
 */

//Less secure, but available in standard distribution:
//https://github.com/bitwiseshiftleft/sjcl/blob/master/core/pbkdf2.js
/** Password-Based Key-Derivation Function, version 2.0.
 *
 * Generate keys from passwords using PBKDF2-HMAC-SHA256.
 *
 * This is the method specified by RSA's PKCS #5 standard.
 *
 * @param {bitArray|String} password  The password.
 * @param {bitArray|String} salt The salt.  Should have lots of entropy.
 * @param {Number} [count=1000] The number of iterations.  Higher numbers make the function slower but more secure.
 * @param {Number} [length] The length of the derived key.  Defaults to the
                            output size of the hash function.
 * @param {Object} [Prff=sjcl.misc.hmac] The pseudorandom function family.
 * @return {bitArray} the derived key.
 */

function generateCharacters(rows, cols, charset) {
    //Using seedrandom.js, https://github.com/davidbau/seedrandom
    //MIT License
    var master = document.getElementById('masterpassword').value;
    //https://github.com/bitwiseshiftleft/sjcl
    //Deriving salt from masterpass at least ensures a unique-ish salt per user, although 
    //not ideal.  Added to 128bit base64 string.
    //var seed = sjcl.misc.scrypt(master, master + 'njk1OhfB2y9mbLYLaFkEkD');
    //Note, using master + 'njk1OhfB2y9mbLYLaFkEkD' above won't add any security
    //because whoever is building the rainbow table will know that from this source.
    var seed = sjcl.misc.scrypt(master, 'njk1OhfB2y9mbLYLaFkEkD');
    Math.seedrandom(seed);
    //Math.seedrandom(sjcl.misc.pbkdf2(seed, 'njk1OhfB2y9mbLYLaFkEkD'));
    var charList = [];
    for (var i=0; i<cols; i++) {
        charList.push(randomString(cols, charset).split(''));
    }
    return charList
}

function generateFill(rows, cols, fill) {
    var charList = [];
    for (var i=0; i<cols; i++) {
        var row = new Array(cols + 1).join(fill);
        charList.push(row.split(''));
    }
    return charList
}

//https://stackoverflow.com/questions/1349404
function randomString(len, charSet) {
    var randomString = '';
    for (var i = 0; i < len; i++) {
        //Math.random here is the special seeded version from seedrandom.js
        var randomPos = Math.floor(Math.random() * charSet.length);
        randomString += charSet.substring(randomPos,randomPos+1);
    }
    return randomString;
}

function highlightPs(obj) {
    var ids = obj.ids;
    st.highlightIds = ids; //Set global

    var pw = obj.pw;
    var delay = 50;

    function changeClass(id) {
        var el = document.getElementById(id);
        el.className = 'clicked';
    }

    if (document.getElementById('highlight').checked) {
        for (var j=0; j<ids.length; j++) {
            setTimeout(changeClass.bind(null, ids[j]), delay*j); 
        }
    }

    var ps = document.getElementById('password');
    ps.value = pw;
}

function handleDir(dir) {
    //[x, y], where South = +y, East = +x 
    var allDir = {
        'N': [0, -1], 'S': [0, 1], 'E':[1, 0], 'W':[-1, 0],
        'NE':[1, -1], 'NW':[-1, -1], 'SE':[1, 1], 'SW':[-1, 1]
    }
    return allDir[dir];
}

/* Grid Traversal Functions */
function lineMatrix(x, y, dir,len) {
    var matrix = st.charList;
    var inc = handleDir(dir);
    var xinc = inc[0];
    var yinc = inc[1];
    var pw = '';
    var ids = [];

    while (pw.length < len) {
        //Handle edge case
        if ( (x === st.cols-1 && x + xinc > st.cols-1) || 
             (x === 0 && x + xinc < 0) || 
             (y === st.rows-1 && y + yinc > st.rows-1) || 
             (y === 0 && y + yinc < 0)) {  

            return handleEdge(x,y,pw,ids,len,matrix);
        }
        //From top left, x is across, y works down on outer arrays
        pw += matrix[y][x];
        ids.push('c' + String(x) + ',' + String(y))
        x += xinc;
        y += yinc;
    }
    //If recursion isn't entered:
    return {pw: pw, ids: ids};
}

function stepMatrix(x, y, dir, len) {
    var matrix = st.charList;
    var inc = handleDir(dir);
    var xinc = inc[0];
    var yinc = inc[1];
    var pw = '';
    var ids = [];
    var across = true;

    while (pw.length < len) {
        //Recurse if hits edge
        if ((x === st.cols-1 && x + xinc > st.cols-1) || 
            (x === 0 && x + xinc < 0) || 
            (y === st.rows-1 && y + yinc > st.rows-1) || 
            (y === 0 && y + yinc < 0)) {  

            return handleEdge(x,y,pw,ids,len,matrix);
        }

        pw += matrix[y][x];  
        ids.push('c' + String(x) + ',' + String(y))

        if (across) {
            x += xinc;
            across = false;
        } else {
            y += yinc;
            across = true;
        }
    }
    //If recursion isn't entered:
    return {pw: pw, ids: ids};

}

function spiralMatrix(x,y,len) {
    var matrix = st.charList; //Global matrix
    var xinc = 1;
    var yinc = -1;
    var xlen = 1;
    var ylen = 1;
    var pw = '';
    var ids = [];
    var across = false;  //Start moving upwards

    while (pw.length < len) {
        //Alternates [Up, Right], [Down, Left] adding 1 cell length each time
        if (across) {
            for (var i=0; i<xlen; i++) {  //Iterate through full arm length
                //Recurse if crossing edge
                if ((x === st.cols-1 && x + xinc > st.cols-1) || 
                    (x === 0 && x + xinc < 0) || 
                    (y === st.rows-1 && y + yinc > st.rows-1) || 
                    (y === 0 && y + yinc < 0)) {  

                    return handleEdge(x,y,pw,ids,len,matrix);
                }
                pw += matrix[y][x]; 
                ids.push('c' + String(x) + ',' + String(y));
                x += xinc; //Increment x in the current direction
                if (pw.length === len) {
                    return {pw: pw, ids: ids};
                }
            }
            xlen += 1;  //Increas arm length for next time
            xinc = -xinc;  //Switch sign of the increment direction
            across = false;  //Move in y direction next
        } else {
            for (var i = 0; i<ylen; i++) {
                //Recurse if on edge
                if ((x === st.cols-1 && x + xinc > st.cols-1) || 
                    (x === 0 && x + xinc < 0) || 
                    (y === st.rows-1 && y + yinc > st.rows-1) || 
                    (y === 0 && y + yinc < 0)) {  

                    return handleEdge(x,y,pw,ids,len,matrix);
                }
                pw += matrix[y][x];  //From top left, x is across, y works down on outer arrays
                ids.push('c' + String(x) + ',' + String(y));
                y += yinc; //Increment y in the current direction
                if (pw.length === len) {
                    return {pw: pw, ids: ids};
                }
            }
            ylen += 1;  //Increas arm length for next time
            yinc = -yinc;  //Switch sign of the increment
            across = true;  //Move in x direction next
        }
    }
    //If recursion isn't entered:
    //return {pw: pw, ids: ids};

}

//Needs some work, developed on accident while
//making spiral.  Just needs a shift for star,
//could also do galaxy style, where offsets in outward
//motion.  This would be too hard to re-create manually, 
//though, if it was needed.  
function starMatrix(x,y,len) {
    var matrix = st.charList; //Global matrix
    var xinc = 1;
    var yinc = -1;
    var pw = '';
    var ids = [];
    var across = false;  //Start upwards

    while (pw.length < len) {

        //Recurse if on edge
        if ((x === st.cols-1 && x + xinc > st.cols-1) || 
            (x === 0 && x + xinc < 0) || 
            (y === st.rows-1 && y + yinc > st.rows-1) || 
            (y === 0 && y + yinc < 0)) {  

            return handleEdge(x,y,pw,ids,len,matrix);
        }

        pw += matrix[y][x];  //From top left, x is across, y works down on outer arrays
        ids.push('c' + String(x) + ',' + String(y))

        //Alternates [Up, Right], [Down, Left] adding 1 cell length each time
        if (across) {
            // for (i<0; i<xinc; i++) {
            //  pw += matri
            // }
            x += xinc;
            xinc = xinc < 0 ? (-1*xinc + 1) : (-1*(xinc + 1)); //Flips sign, gets one longer
            across = false;
        } else {
            y += yinc;
            yinc = yinc < 0 ? (-1*yinc + 1) : (-1*(yinc + 1));; //Flips sign, gets one longer
            across = true;
        }
    }
    //If recursion isn't entered:
    return {pw: pw, ids: ids};

}

function handleEdge(x, y, pw, ids, len, matrix, callback) {
    //Always moves clockwise when it hits an edge
    if (pw.length === len) {
        return {pw: pw, ids: ids};
    }
    //https://stackoverflow.com/questions/33513358
    if (x === y) {  //You're at a SE, NW corner 
        pw += matrix[y][x];
        ids.push('c' + String(x) + ',' + String(y));
        if (x === 0) {
            return handleEdge(x+1, y, pw, ids, len, matrix); //Move right
        } else if (x === st.cols-1) {
            return handleEdge(x-1, y, pw, ids, len, matrix); //Move left
        }
    } else if (x >= st.cols-1) {  
        pw += matrix[y][x];
        ids.push('c' + String(x) + ',' + String(y));
        return handleEdge(x, y+1, pw, ids, len, matrix); //Move down
    } else if (x === 0) {
        pw += matrix[y][x];
        ids.push('c' + String(x) + ',' + String(y));
        return handleEdge(x, y-1, pw, ids, len, matrix); //Move up
    } else if (y >= st.cols-1) {
        pw += matrix[y][x];
        ids.push('c' + String(x) + ',' + String(y));
        return handleEdge(x-1, y, pw, ids, len, matrix); //Move left
    } else if (y === 0) {
        pw += matrix[y][x];
        ids.push('c' + String(x) + ',' + String(y));
        return handleEdge(x+1, y, pw, ids, len, matrix); //Move right
    }
}


/* UI and Helper Functions */

function toggleSe() {
    var x = document.getElementById("masterpassword");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function togglePs() {
    var x = document.getElementById("password");
    if (x.type === "password") {
        x.type = "text";
    } else {
        x.type = "password";
    }
}

function toggleHl() {

    var hl = document.getElementById('highlight').checked;
    var ids = st.highlightIds;
    //Turn on/off at once
    for (var j=0; j<ids.length; j++) {
        var el = document.getElementById(ids[j]);
        el.className = hl ? 'clicked': '';   
    }
}

function toggleMask() {
    if (st.charList.length !== 0 && document.getElementById('mask').checked) {
        populateGrid(st.maskList, animate=false, clear=false);
    } else if (st.charList.length !== 0) {
        populateGrid(st.charList, animate=false, clear=false);
    }
    //Querying checkbox status happens in populateGrid
    // if (st.charList.length !== 0) {
    //     populateGrid(st.maskList, animate=false, clear=false, gen=false);
    // }
}

function copyPs() {
    var x = document.getElementById("password");
    var open = false;
    if(x.type === 'password') {open=true; togglePs();}

    x.select();
    document.execCommand("Copy");
    if(open) {togglePs();}
    //document.getElementById('copy').select();
}

function clearPs() {
    var ps = document.getElementById('password');
    ps.value = '';
    //Clear highlight ids
    st.highlightIds = [];
    //Remove all highlighted classes
    //https://stackoverflow.com/questions/22754315
    var hls = Array.from(document.getElementsByClassName('clicked'));
    hls.map(function(el){el.className = '';});
}

function clearAll() {
    appendGrid(st.blankList);
    clearPs();
    st.charList = [];//Clear global character list;
    var el = document.getElementById('masterpassword');
    el.value = '';
}


function renderDirections() {
    var meth = document.getElementById('method');
    var method = meth.options[meth.selectedIndex].value;
    var dir = document.getElementById('dir');

    var options = {
        'cardinal': ['N', 'S', 'E', 'W'],
        'angle': ['NE', 'NW', 'SE', 'SW']
    }

    if (method === 'line') {
        var sel = document.createElement('select');
        sel.id = 'direction';
        var opts = options.cardinal.concat(options.angle);
        opts.forEach(function(opt) {
            var el = document.createElement('option');
            el.value = opt;
            el.textContent = opt;
            sel.appendChild(el);
        });
        dir.innerHTML = 'Direction: ' + sel.outerHTML;
    } else if (method === 'step') {
        var sel = document.createElement('select');
        sel.id = 'direction';
        var opts = options.angle;
        opts.forEach(function(opt) {
            var el = document.createElement('option');
            el.value = opt;
            el.textContent = opt;
            sel.appendChild(el);
        });
        dir.innerHTML = 'Direction: ' + sel.outerHTML;
    } else {
        //Clear any dropdown menu
        dir.innerHTML = '';
    } 
}

/*Warning: Changes to these will alter all password outputs*/
function chooseCharacters() {
    var sel = document.getElementById('characters');
    var method = sel.options[sel.selectedIndex].value;
    var chars;
    switch(method) {
        case 'advanced':
            chars = passchars.standard + passchars.advanced;
            break;
        case 'standard':
            chars = passchars.standard;
            break;
        case 'alphanumeric':
            chars = passchars.letters + passchars.numbers;
            break;
        case 'letters':
            chars = passchars.letters;
            break;
        case 'numbers':
            chars = passchars.numbers;
            break;
    }
    st.charset = chars;  //Set global object setting
}

// var passchars_old = {
//  V: "AEIOU",
//  C: "BCDFGHJKLMNPQRSTVWXYZ",
//  v: "aeiou",
//  c: "bcdfghjklmnpqrstvwxyz",
//  A: "AEIOUBCDFGHJKLMNPQRSTVWXYZ",
//  a: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz",
//  n: "0123456789",
//  o: "@&%?,=[]_:-+*$#!'^~;()/.",
//  x: "AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()",
//  " ": " "
// };

function printPage() {
    //https://stackoverflow.com/questions/30167749
    window.print();
}

function openTab(evt, tabName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    console.log(evt);

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    //evt.currentTarget.className += " active";
    evt.originalTarget.className += " active";
}

function openSettings() {
    var el = document.getElementById('settings');
    var cls = el.className;
    //console.log(e);
    //var cls = e.target.className;
    console.log(cls);
    if (cls.indexOf('active') == -1) {
        el.className += ' active';
    } else {
        el.className = cls.replace(' active', '');
    }
}

// Need to replace all function calls within popup.html with even listeners
// that wait for a click or onchange events on the elements.  
//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Add_a_button_to_the_toolbar
//https://github.com/mdn/webextensions-examples/blob/master/menu-demo/background.js
document.addEventListener("click", function(e) {
    switch (e.target.id) {
        case "showpassword":
            toggleSe();
            break;
        case "mask":
            toggleMask();
            break;
        case "create":
            create();
            break;
        case "cleartable":
            clearAll();
            break;
        case "print":
            printPage();
            break;
        case "highlight":
            toggleHl();
            break;
        case "show":
            togglePs();
            break;
        case "copy":
            copyPs();
            break;
        case "clearpassword":
            clearPs();
            break;
    }
});

//https://stackoverflow.com/questions/2889840
document.addEventListener("change", function(e) {
    switch (e.target.id) {
        case "characters":
            chooseCharacters();
            break;
        case "method":
            renderDirections();
            break;
    }
});

document.addEventListener("DOMContentLoaded", function(){
    //document.getElementById('masterpassword').focus();
    document.getElementById('masterform').onsubmit = function(){return false;}
});
