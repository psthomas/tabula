The sjcl_build.js file is needed because the [standard](https://github.com/bitwiseshiftleft/sjcl/blob/master/sjcl.js) sjcl.js file doesn't include their [scrypt](https://github.com/bitwiseshiftleft/sjcl/blob/master/core/scrypt.js) function.  I built it using these steps:
```
$ git clone https://github.com/bitwiseshiftleft/sjcl.git
$ cd sjcl
$ ./configure --with-all
$ make
```