# Tabula

*A minimal, stateless password manager*

**What does it do?** Tabula helps you create and remember strong passwords for each site without having to store them anywhere.

**How does it work?** When you enter a master password, a table of characters that's unique to your password is created. You then use this table to generate site-specific passwords by starting at a memorable cell and following a pattern across the grid. When you need a site's password in the future, just regenerate this table using your master password, find the starting cell, and follow the pattern. This way you can remember strong passwords for every site without the risk of storing them anywhere.

Try it out [here](https://pstblog.com/vis/tabula.html), or read more about it on my [blog](https://pstblog.com/2018/1/21/password-manager).

![Example Image](example.png) 

## About

The name Tabula comes from a cryptographic tool called a [tabula recta](https://en.wikipedia.org/wiki/Tabula_recta), which is used to create cyphers. I came across this concept while reading John Graham-Cumming's [blog post](http://blog.jgc.org/2010/12/write-your-passwords-down.html) outlining how he uses a tabula to generate his own passwords. I decided to make the technique more user friendly by allowing access on the web and automating a few steps, so this is the result.

The table of characters is created by seeding a random number generator ([seedrandom.js](https://github.com/davidbau/seedrandom)) with your master password. The end result is a unique table that will be re-created whenever you enter your master password in the future. This makes it easy to have many strong, site-specific passwords while just remembering a master password and a pattern.

## Characters

These are the characters that can be used to generate passwords:

Letters, numbers, advanced symbols: `AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()?,=[]_:+*'~;/.{}`

Letters, numbers, symbols: `AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789!@#$%^&*()`

Letters, numbers: `AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz0123456789`

Letters: `AEIOUaeiouBCDFGHJKLMNPQRSTVWXYZbcdfghjklmnpqrstvwxyz`

Numbers: `0123456789`

## Security

Security is important when it comes to passwords, so everything is included in a single HTML file that doesn't depend on any externally loaded scripts or make network requests (your master password is never sent anywhere). As a result, you can still use this page when you're offline, or download the HTML file and use it locally. Also, you could print out the generated table and only use the website in situations where you don't have access to a physical copy.

Still, it would be ideal to never use a browser for this at all, so I've been looking at using react native for a mobile app, or something like electron to create a cross-platform desktop app if there is interest, although that might be overly complicated for this application.

These are the current sha256 checksums of the files:

`tabula.html`:
```
$ shasum -pa 256 tabula.html
bcbe946f686724efff4cc15ceded040efef6847ee2dc36b33509abe7f5d951c9 ?tabula.html
```

`tabula-embed.html`:
 ```
$ shasum -pa 256 tabula-embed.html
bab8d5432b549bb879351b21cc386f9f2a08624131c9ae0f7c64d3194f721a91 ?tabula-embed.html
 ```