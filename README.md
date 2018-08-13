<p align="center">
    <a href="http://alex-d.github.io/Trumbowyg/"><img src="banner.jpg" alt="Trumbowyg logo" /></a>
</p>

<p align="center">
    <a href="https://cdnjs.com/libraries/Trumbowyg"><img src="https://img.shields.io/cdnjs/v/Trumbowyg.svg" alt="CDNJS" /></a>
    <a href="https://www.npmjs.com/package/trumbowyg"><img src="https://img.shields.io/npm/dm/trumbowyg.svg" alt="Downloads" /></a>
    <a href="https://www.npmjs.com/package/trumbowyg"><img src="https://img.shields.io/npm/v/trumbowyg.svg" alt="Version on npm" /></a>
    <img src="https://img.shields.io/bower/v/trumbowyg.svg" alt="Version on bower" />
    <a href="https://github.com/Alex-D/Trumbowyg/blob/develop/LICENSE"><img src="https://img.shields.io/npm/l/trumbowyg.svg" alt="Licence" /></a>
</p>


<h2 align="center">Supporting Trumbowyg</h2>

Trumbowyg is an MIT-licensed open source project and completely free to use.

However, the amount of effort needed to maintain and develop new features for 
the project is not sustainable without proper financial backing. 
You can support it's ongoing development by being a backer or a sponsor:
 
- [Become a backer or sponsor on Patreon](https://www.patreon.com/alexandredemode)
- [One-time donation via PayPal](https://www.paypal.me/alexandredemode/20eur)

<h3 align="center">Sponsors</h3>

<h4 align="center">Gold</h4>

<p align="center">
    <a href="https://avot.nl/?ref=trumbowyg">
        <img src="https://cdn.rawgit.com/Alex-D/Trumbowyg/develop/sponsors/avot.svg" alt="avot®" width="200px"/>
    </a>
    &nbsp;
    &nbsp;
    &nbsp;
    <a href="https://www.appseed.us/?ref=trumbowyg">
        <img src="https://cdn.rawgit.com/Alex-D/Trumbowyg/develop/sponsors/appseed.png" alt="AppSeed" width="200px"/>
    </a>
</p>

<p align="center">
    <a href="https://www.patreon.com/bePatron?c=1176005&rid=1940456">
        Become a Sponsor
    </a>
</p>

------------------------------------

## Introduction

Trumbowyg is a simple and lightweight WYSIWYG editor, weight only 20kB minifed (8kB gzip) for faster page loading.

Visit presentation page: http://alex-d.github.io/Trumbowyg/


## Info for the nojquery branch

The "nojquery" branch does not require jquery. However it use features from ES6 (next generation javascript) so your
webbrowser might not support it. You could try using various polyfills for fetch, promise and interator. Note that 
the bransh is expreimental so some features might not work and are prone to errors. Also plugins do not work (yet).
The build tools have been changed to webpack so you might need to install it. As for now, this is how you invoke
Trumbowyg:

```js
var element = document.getElementById("sometextarea");
trumbowyg.trumbowyg.init(element, options, params);
```

So it is different from the jquery version. Note that "trumbowyg.trumbowyg" is not a typo.


## Documentation

All you need to know about Trumbowyg is here: http://alex-d.github.io/Trumbowyg/documentation/ (or even [on the home](http://alex-d.github.io/Trumbowyg/#get-started))


## Contribution

You can contribute to Trumbowyg with translations in languages you know.
Thanks to `node` you can improve core script, style or icons easily.

First, fork and clone the repository

```bash
cd Trumbowyg # to go into the project's root directory
npm install # to install development dependencies
npm run build # to build the project
```


## Stay in touch

For the latest release and announcements, follow on Twitter: [@AlexandreDemode](https://twitter.com/AlexandreDemode)


## License

This project is under [MIT license](LICENSE).
