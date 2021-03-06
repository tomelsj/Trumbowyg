export var trumbowyg = {
    langs: {
        en: {
            viewHTML: 'View HTML',

            undo: 'Undo',
            redo: 'Redo',

            formatting: 'Formatting',
            p: 'Paragraph',
            blockquote: 'Quote',
            code: 'Code',
            header: 'Header',

            bold: 'Bold',
            italic: 'Italic',
            strikethrough: 'Stroke',
            underline: 'Underline',

            strong: 'Strong',
            em: 'Emphasis',
            del: 'Deleted',

            superscript: 'Superscript',
            subscript: 'Subscript',

            unorderedList: 'Unordered list',
            orderedList: 'Ordered list',

            insertImage: 'Insert Image',
            link: 'Link',
            createLink: 'Insert link',
            unlink: 'Remove link',

            justifyLeft: 'Align Left',
            justifyCenter: 'Align Center',
            justifyRight: 'Align Right',
            justifyFull: 'Align Justify',

            horizontalRule: 'Insert horizontal rule',
            removeformat: 'Remove format',

            fullscreen: 'Fullscreen',

            close: 'Close',

            submit: 'Confirm',
            reset: 'Cancel',

            required: 'Required',
            description: 'Description',
            title: 'Title',
            text: 'Text',
            target: 'Target',
            width: 'Width'
        }
    },

    // Plugins
    plugins: {},

    // SVG Path globally
    svgPath: null,

    hideButtonTexts: null
};

// Makes default options read-only
Object.defineProperty(trumbowyg, 'defaultOptions', {
    value: {
        lang: 'en',

        fixedBtnPane: false,
        fixedFullWidth: false,
        autogrow: false,
        autogrowOnEnter: false,
        imageWidthModalEdit: false,

        prefix: 'trumbowyg-',

        semantic: true,
        resetCss: false,
        removeformatPasted: false,
        tagsToRemove: [],
        btns: [
            ['viewHTML'],
            ['undo', 'redo'], // Only supported in Blink browsers
            ['formatting'],
            ['strong', 'em', 'del'],
            ['superscript', 'subscript'],
            ['link'],
            ['insertImage'],
            ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
            ['unorderedList', 'orderedList'],
            ['horizontalRule'],
            ['removeformat'],
            ['fullscreen']
        ],
        // For custom button definitions
        btnsDef: {},

        inlineElementsSelector: 'a,abbr,acronym,b,caption,cite,code,col,dfn,dir,dt,dd,em,font,hr,i,kbd,li,q,span,strikeout,strong,sub,sup,u',

        pasteHandlers: [],

        // imgDblClickHandler: default is defined in constructor

        plugins: {},
        urlProtocol: false,
        minimalLinks: false
    },
    writable: false,
    enumerable: true,
    configurable: false
});

var activeTrumbowygs = [];

(function (navigator, window, document, trumbowyg, activeTrumbowygs) {
    'use strict';

    var CONFIRM_EVENT = 'tbwconfirm',
        CANCEL_EVENT = 'tbwcancel';

    /** Set up trumbowyg element from the element, it must be appended to the document */
    trumbowyg.init = function (element, options) {
        let trumbowygDataName = 'trumbowyg';
        if (options === Object(options) || !options) {
            let elearr = element;
            if (!Array.isArray(elearr)) {
                elearr = [element];
            }
            
            for (let te of elearr) {
                if (!te.dataset[trumbowygDataName]) {
                    activeTrumbowygs.push(new Trumbowyg(te, options));
                    te.dataset[trumbowygDataName] = activeTrumbowygs.length - 1;
                }
            }
            
            return element;
        }

        return false;
    };
    
    /** Get trumbowyg from element, can also be a index string */
    trumbowyg.getFromElement = function (element) {
        let trumbowygDataName = 'trumbowyg';
        let trumbowygObj;
        let isdomelement = false;
        
        if (!element) {
            return false;
        }
        
        try {
            //Using W3 DOM2 (works for FF, Opera and Chrome)
            isdomelement = element instanceof HTMLElement;
        }
        catch (e){
            //Browsers not supporting W3 DOM2 don't have HTMLElement and
            //an exception is thrown and we end up here. Testing some
            //properties that all elements have (works on IE7)
            isdomelement = (typeof element === 'object') &&
                (element.nodeType === 1) && (typeof element.style === 'object') &&
                (typeof element.ownerDocument === 'object');
        }
        
        if (isdomelement) {
            if (element.dataset[trumbowygDataName] && activeTrumbowygs[element.dataset[trumbowygDataName]]) {
                trumbowygObj = activeTrumbowygs[element.dataset[trumbowygDataName]];
            }
        } else {
            if (activeTrumbowygs[element]) {
                trumbowygObj = activeTrumbowygs[element];
            }
        }
        
        if (trumbowygObj) {
            return trumbowygObj;
        }
        
        return false;
    };
    
    /** Run the given command on the trumbowyg element and return the result */
    trumbowyg.commandElement = function (element, command, params) {
        let t = trumbowyg.getFromElement(element);
        if (t) {
            try {
                switch (command) {
                // Exec command
                case 'execCmd':
                    return t.execCmd(params.cmd, params.param, params.forceCss);

                // Modal box
                case 'openModal':
                    return t.openModal(params.title, params.content);
                case 'closeModal':
                    return t.closeModal();
                case 'openModalInsert':
                    return t.openModalInsert(params.title, params.fields, params.callback);

                // Range
                case 'saveRange':
                    return t.saveRange();
                case 'getRange':
                    return t.range;
                case 'getRangeText':
                    return t.getRangeText();
                case 'restoreRange':
                    return t.restoreRange();

                // Enable/disable
                case 'enable':
                    return t.setDisabled(false);
                case 'disable':
                    return t.setDisabled(true);

                // Toggle
                case 'toggle':
                    return t.toggle();

                // Destroy
                case 'destroy':
                    return t.destroy();

                // Empty
                case 'empty':
                    return t.empty();

                // HTML
                case 'html':
                    return t.html(params);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
        
        return false;
    };

    // @param: editorElem is the DOM element
    var Trumbowyg = function (editorElem, options) {
        var t = this,
            trumbowygIconsId = 'trumbowyg-icons';

        // Get the document of the element. It use to makes the plugin
        // compatible on iframes.
        t.doc = editorElem.ownerDocument || document;

        // jQuery object of the editor
        t.$ta = editorElem; // $ta : Textarea
        t.$c = editorElem; // $c : creator

        options = options || {};

        // Localization management
        if (options.lang != null || trumbowyg.langs[options.lang] != null) {
            t.lang = Object.create(trumbowyg.langs.en);
            Object.assign(t.lang, trumbowyg.langs[options.lang]);
        } else {
            t.lang = trumbowyg.langs.en;
        }

        t.hideButtonTexts = trumbowyg.hideButtonTexts != null ? trumbowyg.hideButtonTexts : options.hideButtonTexts;

        // SVG path
        var svgPathOption = trumbowyg.svgPath != null ? trumbowyg.svgPath : options.svgPath;
        t.hasSvg = svgPathOption !== false;
        t.svgPath = !t.doc.querySelector('base') ? window.location.href.split('#')[0] : '';
        if (!t.doc.querySelector('#' + trumbowygIconsId) && svgPathOption !== false) {
            if (svgPathOption == null) {
                // Hack to get svgPathOption based on trumbowyg.js path
                var scriptElements = document.getElementsByTagName('script');
                for (var i = 0; i < scriptElements.length; i += 1) {
                    var source = scriptElements[i].src;
                    var matches = source.match('trumbowyg(.min)?.js');
                    if (matches != null) {
                        svgPathOption = source.substring(0, source.indexOf(matches[0])) + 'ui/icons.svg';
                    }
                }
                if (svgPathOption == null) {
                    console.warn('You must define svgPath: https://goo.gl/CfTY9U'); // jshint ignore:line
                }
            }

            var div = t.doc.createElement('div');
            div.id = trumbowygIconsId;
            t.doc.body.insertBefore(div, t.doc.body.childNodes[0]);
            fetch(svgPathOption, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded;  charset=utf-8'
                }
            }).then(function (resp) {
                return resp.text();
            }).then(function (data) {
                div.innerHTML = data;
            });
        }


        /**
         * When the button is associated to a empty object
         * fn and title attributs are defined from the button key value
         *
         * For example
         *      foo: {}
         * is equivalent to :
         *      foo: {
         *          fn: 'foo',
         *          title: this.lang.foo
         *      }
         */
        var h = t.lang.header, // Header translation
            isBlinkFunction = function () {
                return (window.chrome || (window.Intl && Intl.v8BreakIterator)) && 'CSS' in window;
            };
        t.btnsDef = {
            viewHTML: {
                fn: 'toggle',
                class: 'trumbowyg-not-disable',
            },

            undo: {
                isSupported: isBlinkFunction,
                key: 'Z'
            },
            redo: {
                isSupported: isBlinkFunction,
                key: 'Y'
            },

            p: {
                fn: 'formatBlock'
            },
            blockquote: {
                fn: 'formatBlock'
            },
            h1: {
                fn: 'formatBlock',
                title: h + ' 1'
            },
            h2: {
                fn: 'formatBlock',
                title: h + ' 2'
            },
            h3: {
                fn: 'formatBlock',
                title: h + ' 3'
            },
            h4: {
                fn: 'formatBlock',
                title: h + ' 4'
            },
            subscript: {
                tag: 'sub'
            },
            superscript: {
                tag: 'sup'
            },

            bold: {
                key: 'B',
                tag: 'b'
            },
            italic: {
                key: 'I',
                tag: 'i'
            },
            underline: {
                tag: 'u'
            },
            strikethrough: {
                tag: 'strike'
            },

            strong: {
                fn: 'bold',
                key: 'B'
            },
            em: {
                fn: 'italic',
                key: 'I'
            },
            del: {
                fn: 'strikethrough'
            },

            createLink: {
                key: 'K',
                tag: 'a'
            },
            unlink: {},

            insertImage: {},

            justifyLeft: {
                tag: 'left',
                forceCss: true
            },
            justifyCenter: {
                tag: 'center',
                forceCss: true
            },
            justifyRight: {
                tag: 'right',
                forceCss: true
            },
            justifyFull: {
                tag: 'justify',
                forceCss: true
            },

            unorderedList: {
                fn: 'insertUnorderedList',
                tag: 'ul'
            },
            orderedList: {
                fn: 'insertOrderedList',
                tag: 'ol'
            },

            horizontalRule: {
                fn: 'insertHorizontalRule'
            },

            removeformat: {},

            fullscreen: {
                class: 'trumbowyg-not-disable'
            },
            close: {
                fn: 'destroy',
                class: 'trumbowyg-not-disable'
            },

            // Dropdowns
            formatting: {
                dropdown: ['p', 'blockquote', 'h1', 'h2', 'h3', 'h4'],
                ico: 'p'
            },
            link: {
                dropdown: ['createLink', 'unlink']
            }
        };

        // Defaults Options
        t.o = Object.create(trumbowyg.defaultOptions);
        Object.assign(t.o, options);

        if (!t.o.hasOwnProperty('imgDblClickHandler')) {
            t.o.imgDblClickHandler = t.getDefaultImgDblClickHandler;
        }

        t.urlPrefix = t.setupUrlPrefix();

        t.disabled = t.o.disabled || (editorElem.nodeName === 'TEXTAREA' && editorElem.disabled);

        if (options.btns) {
            t.o.btns = options.btns;
        } else if (!t.o.semantic) {
            t.o.btns[3] = ['bold', 'italic', 'underline', 'strikethrough'];
        }

        for (const [btnName, btnDef] of Object.entries(t.o.btnsDef)) {
            t.addBtnDef(btnName, btnDef);
        }

        // put this here in the event it would be merged in with options
        t.eventNamespace = 'trumbowyg-event';

        // Keyboard shortcuts are load in this array
        t.keys = [];

        // Tag to button dynamically hydrated
        t.tagToButton = {};
        t.tagHandlers = [];

        // Admit multiple paste handlers
        t.pasteHandlers = [].concat(t.o.pasteHandlers);

        // Check if browser is IE
        t.isIE = (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') !== -1);

        t.init();
    };

    Trumbowyg.prototype = {
        DEFAULT_SEMANTIC_MAP: {
            'b': 'strong',
            'i': 'em',
            's': 'del',
            'strike': 'del',
            'div': 'p'
        },

        init: function () {
            var t = this;
            t.height = t.$ta.clientHeight;

            t.initPlugins();

            try {
                // Disable image resize, try-catch for old IE
                t.doc.execCommand('enableObjectResizing', false, false);
                t.doc.execCommand('defaultParagraphSeparator', false, 'p');
            } catch (e) {
                console.error(e);
            }

            t.buildEditor();
            t.buildBtnPane();

            t.fixedBtnPaneEvents();

            t.buildOverlay();

            setTimeout(function () {
                if (t.disabled) {
                    t.setDisabled(true);
                }
                var tbwinitev = new CustomEvent('tbwinit');
                t.$c.dispatchEvent(tbwinitev);
            });
        },

        addBtnDef: function (btnName, btnDef) {
            this.btnsDef[btnName] = btnDef;
        },

        setupUrlPrefix: function () {
            var protocol = this.o.urlProtocol;
            if (!protocol) {
                return;
            }

            if (typeof(protocol) !== 'string') {
                return 'https://';
            }
            return /:\/\/$/.test(protocol) ? protocol : protocol + '://';
        },

        buildEditor: function () {
            var t = this,
                prefix = t.o.prefix,
                html = '';

            t.$box = t.doc.createElement('div');
            t.$box.className = prefix + 'box ' + prefix + 'editor-visible ' + prefix + t.o.lang + ' trumbowyg';

            // $ta = Textarea
            // $ed = Editor
            t.isTextarea = t.$ta.nodeName.toLowerCase() === 'textarea';
            if (t.isTextarea) {
                html = t.$ta.value;
                t.$ed = t.doc.createElement('div');
                t.$box.appendChild(t.$ed);
                t.$ta.insertAdjacentElement('afterend', t.$box);
                t.$box.appendChild(t.$ta);
            } else {
                t.$ed = t.$ta;
                html = t.$ed.innerHTML;

                t.$ta = t.doc.createElement('textarea');
                t.$ta.name = t.$ta.id;
                t.$ta.style.height =  t.height;
                t.$ta.value = html;
                
                t.$box.appendChild(t.$ta);
                t.$ed.insertAdjacentElement('afterend', t.$box);
                t.$box.appendChild(t.$ed);
                
                t.syncCode();
            }

            t.$ta.classList.add(prefix + 'textarea');
            t.$ta.setAttribute('tabindex', -1);

            t.$ed.classList.add(prefix + 'editor');
            t.$ed.contentEditable = true;
            t.$ed.setAttribute('dir', t.lang._dir || 'ltr');
            t.$ed.innerHTML = html;

            if (t.o.tabindex) {
                t.$ed.setAttribut('tabindex', t.o.tabindex);
            }

            if (t.$c.hasAttribute('placeholder')) {
                t.$ed.setAttribute('placeholder', t.$c.getAttribute('placeholder'));
            }

            if (t.$c.hasAttribute('spellcheck')) {
                t.$ed.setAttribute('spellcheck', t.$c.getAttribute('spellcheck'));
            }

            if (t.o.resetCss) {
                t.$ed.classList.add(prefix + 'reset-css');
            }

            if (!t.o.autogrow) {
                t.$ta.style.height = t.height;
                t.$ed.style.height = t.height;
            }

            t.semanticCode();

            if (t.o.autogrowOnEnter) {
                t.$ed.classList.add(prefix + 'autogrow-on-enter');
            }

            var ctrl = false,
                composition = false,
                debounceButtonPaneStatus,
                updateEventName = 'keyup';

            t.$ed.addEventListener('dblclick', t.o.imgDblClickHandler);
            
            function ctrlTimeoutHandler(e) {
                if ((!e.ctrlKey && !e.metaKey) || e.altKey) {
                    setTimeout(function () { // "hold on" to the ctrl key for 50ms
                        ctrl = false;
                    }, 50);
                }
                clearTimeout(debounceButtonPaneStatus);
                debounceButtonPaneStatus = setTimeout(function () {
                    t.updateButtonPaneStatus();
                });
            }
            t.$ed.addEventListener('keydown', function (e) {
                if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                    ctrl = true;
                    var key = t.keys[String.fromCharCode(e.which).toUpperCase()];

                    try {
                        t.execCmd(key.fn, key.param);
                        return false;
                    } catch (c) {
                        console.error(c);
                    }
                }
                
                ctrlTimeoutHandler(e);
            });
            
            t.$ed.addEventListener('compositionstart', function () {
                composition = true;
            });
            t.$ed.addEventListener('compositionupdate', function () {
                composition = true;
            });
            
            function composeEndHandler(e) {
                if (e.type === 'compositionend') {
                    composition = false;
                } else if (composition) {
                    return;
                }

                var keyCode = e.which;

                if (keyCode >= 37 && keyCode <= 40) {
                    return;
                }

                if ((e.ctrlKey || e.metaKey) && (keyCode === 89 || keyCode === 90)) {
                    t.$c.dispatchEvent(new CustomEvent('tbwchange'));
                } else if (!ctrl && keyCode !== 17) {
                    var compositionEndIE = t.isIE ? e.type === 'compositionend' : true;
                    t.semanticCode(false, compositionEndIE && keyCode === 13);
                    var tbwchangeev = new CustomEvent('tbwchange');
                    t.$c.dispatchEvent(tbwchangeev);
                } else if (typeof e.which === 'undefined') {
                    t.semanticCode(false, false, true);
                }

                setTimeout(function () {
                    ctrl = false;
                }, 50);
            }
            t.$ed.addEventListener(updateEventName, composeEndHandler);
            t.$ed.addEventListener('compositionend', composeEndHandler);
            
            t.$ed.addEventListener('mouseup', ctrlTimeoutHandler);
            t.$ed.addEventListener('keyup', ctrlTimeoutHandler);

            function focusblur(e) {
                t.$c.dispatchEvent(new CustomEvent('tbw' + e.type));
                if (e.type === 'blur') {
                    let activebutton = t.doc.querySelector('.' + prefix + 'active-button', t.$btnPane);
                    if (activebutton) {
                        activebutton.classList(prefix + 'active-button ' + prefix + 'active');
                    }
                }
                if (t.o.autogrowOnEnter) {
                    if (t.autogrowOnEnterDontClose) {
                        return;
                    }
                    if (e.type === 'focus') {
                        t.autogrowOnEnterWasFocused = true;
                        t.autogrowEditorOnEnter();
                    }
                    else if (!t.o.autogrow) {
                        t.$ed.css({height: t.$ed.css('min-height')});
                        t.$c.dispatchEvent(new CustomEvent('tbwresize'));
                    }
                }
            }
            t.$ed.addEventListener('focus', focusblur);
            t.$ed.addEventListener('blur', focusblur);

            t.$ed.addEventListener('cut', function () {
                setTimeout(function () {
                    t.semanticCode(false, true);
                    t.$c.dispatchEvent(new CustomEvent('tbwchange'));
                }, 0);
            });
            
            t.$ed.addEventListener('paste', function (e) {
                if (t.o.removeformatPasted) {
                    e.preventDefault();

                    if (window.getSelection && window.getSelection().deleteFromDocument) {
                        window.getSelection().deleteFromDocument();
                    }

                    try {
                        // IE
                        var text = window.clipboardData.getData('Text');

                        try {
                            // <= IE10
                            t.doc.selection.createRange().pasteHTML(text);
                        } catch (c) {
                            // IE 11
                            t.doc.getSelection().getRangeAt(0).insertNode(t.doc.createTextNode(text));
                        }
                        t.$c.dispatchEvent(new CustomEvent('tbwchange', e));
                    } catch (d) {
                        // Not IE
                        t.execCmd('insertText', (e.originalEvent || e).clipboardData.getData('text/plain'));
                    }
                }

                // Call pasteHandlers
                for (let pasteHandler of t.pasteHandlers) {
                    pasteHandler(e);
                }

                setTimeout(function () {
                    t.semanticCode(false, true);
                    t.$c.dispatchEvent(new CustomEvent('tbwpaste', e));
                }, 0);
            });

            t.$ta.addEventListener('keyup', function () {
                t.$c.dispatchEvent(new CustomEvent('tbwchange'));
            });
            t.$ta.addEventListener('paste', function () {
                setTimeout(function () {
                    t.$c.dispatchEvent(new CustomEvent('tbwchange'));
                }, 0);
            });

            t.$box.addEventListener('keydown', function (e) {
                if (e.which === 27 && t.doc.querySelector('.' + prefix + 'modal-box', t.$box)) {
                    t.closeModal();
                    return false;
                }
            });
        },

        //autogrow when entering logic
        autogrowEditorOnEnter: function () {
            var t = this;
            t.$ed.classList.remove('autogrow-on-enter');
            var oldHeight = t.$ed[0].clientHeight;
            t.$ed.style.height = 'auto';
            var totalHeight = t.$ed[0].scrollHeight;
            t.$ed.classList.add('autogrow-on-enter');
            if (oldHeight !== totalHeight) {
                t.$ed.style.height = oldHeight;
                setTimeout(function () {
                    t.$ed.style.height = totalHeight;
                    var tbwresizeev = new CustomEvent('tbwresize');
                    t.$c.dispatchEvent(tbwresizeev);
                }, 0);
            }
        },


        // Build button pane, use o.btns option
        buildBtnPane: function () {
            var t = this,
                prefix = t.o.prefix;

            var $btnPane = t.doc.createElement('div');
            $btnPane.className = prefix + 'button-pane';
            
            t.$btnPane = $btnPane;

            for (var btnGrp of t.o.btns) {
                if (!Array.isArray(btnGrp)) {
                    btnGrp = [btnGrp];
                }

                var $btnGroup = t.doc.createElement('div');
                $btnGroup.className = prefix + 'button-group ' + ((btnGrp.indexOf('fullscreen') >= 0) ? prefix + 'right' : '');

                for (var btn of btnGrp) {
                    try { // Prevent buildBtn error
                        if (t.isSupportedBtn(btn)) { // It's a supported button
                            $btnGroup.appendChild(t.buildBtn(btn));
                        }
                    } catch (c) {
                        console.error(c);
                    }
                }

                if ($btnGroup.innerHTML.trim().length > 0) {
                    $btnPane.appendChild($btnGroup);
                }
            }

            t.$box.insertBefore($btnPane, t.$box.childNodes[0]);
        },


        // Build a button and his action
        buildBtn: function (btnName) { // btnName is name of the button
            var t = this,
                prefix = t.o.prefix,
                btn = t.btnsDef[btnName],
                isDropdown = btn.dropdown,
                hasIcon = btn.hasIcon != null ? btn.hasIcon : true,
                textDef = t.lang[btnName] || btnName;

            var $btn = t.doc.createElement('button');
            $btn.setAttribute('type', 'button');
            $btn.className = prefix + btnName + '-button ' + (btn.class || '') + (!hasIcon ? ' ' + prefix + 'textual-button' : '');
            $btn.innerHTML = t.hasSvg && hasIcon ?
                '<svg><use xlink:href="' + t.svgPath + '#' + prefix + (btn.ico || btnName).replace(/([A-Z]+)/g, '-$1').toLowerCase() + '"/></svg>' :
                t.hideButtonTexts ? '' : (btn.text || btn.title || t.lang[btnName] || btnName);
            $btn.setAttribute('title', (btn.title || btn.text || textDef) + ((btn.key) ? ' (Ctrl + ' + btn.key + ')' : ''));
            $btn.setAttribute('tabindex', -1);
            $btn.addEventListener('mousedown', function (ev) {
                let dropdownButton = t.doc.querySelector('.' + btnName + '-' + prefix + 'dropdown', t.$box);
                if (!isDropdown || dropdownButton && dropdownButton.getAttribute('hidden')) {
                    var mousedownev = new CustomEvent('mousedown');
                    t.doc.body.dispatchEvent(mousedownev);
                }

                if ((t.$btnPane.classList.contains(prefix + 'disable') || t.$box.classList.contains(prefix + 'disabled')) &&
                    !ev.target.classList.contains(prefix + 'active') &&
                    !ev.target.classList.contains(prefix + 'not-disable')) {
                    return false;
                }

                t.execCmd((isDropdown ? 'dropdown' : false) || btn.fn || btnName, btn.param || btnName, btn.forceCss);

                return false;
            });

            if (isDropdown) {
                $btn.classList.add(prefix + 'open-dropdown');
                var dropdownPrefix = prefix + 'dropdown';
                var dropdownOptions = { // the dropdown
                    class: dropdownPrefix + '-' + btnName + ' ' + dropdownPrefix + ' ' + prefix + 'fixed-top'
                };
                dropdownOptions['data-' + dropdownPrefix] = btnName;
                var $dropdown = t.doc.createElement('div');
                $dropdown.className = dropdownPrefix + '-' + btnName + ' ' + dropdownPrefix + ' ' + prefix + 'fixed-top';

                for (let def of isDropdown) {
                    if (t.btnsDef[def] && t.isSupportedBtn(def)) {
                        $dropdown.appendChild(t.buildSubBtn(def));
                    }
                }
                
                $dropdown.style.display = 'none';
                
                t.$box.appendChild($dropdown);
            } else if (btn.key) {
                t.keys[btn.key] = {
                    fn: btn.fn || btnName,
                    param: btn.param || btnName
                };
            }

            if (!isDropdown) {
                t.tagToButton[(btn.tag || btnName).toLowerCase()] = btnName;
            }

            return $btn;
        },
        // Build a button for dropdown menu
        // @param n : name of the subbutton
        buildSubBtn: function (btnName) {
            var t = this,
                prefix = t.o.prefix,
                btn = t.btnsDef[btnName],
                hasIcon = btn.hasIcon != null ? btn.hasIcon : true;

            if (btn.key) {
                t.keys[btn.key] = {
                    fn: btn.fn || btnName,
                    param: btn.param || btnName
                };
            }

            t.tagToButton[(btn.tag || btnName).toLowerCase()] = btnName;

            var subbutton = t.doc.createElement('button');
            subbutton.setAttribute('type', 'button');
            subbutton.className = prefix + btnName + '-dropdown-button' + (btn.ico ? ' ' + prefix + btn.ico + '-button' : '');
            subbutton.innerHTML = 
                t.hasSvg && hasIcon ? '<svg><use xlink:href="' + t.svgPath + '#' + prefix + 
                (btn.ico || btnName).replace(/([A-Z]+)/g, '-$1').toLowerCase() + '"/></svg>' + 
                (btn.text || btn.title || t.lang[btnName] || btnName) : (btn.text || btn.title || t.lang[btnName] || btnName);
            subbutton.setAttribute('title', ((btn.key) ? ' (Ctrl + ' + btn.key + ')' : null));
            subbutton.style = btn.style || null;
            subbutton.addEventListener('mousedown', function () {
                var mousedownev = new CustomEvent('mousedown');
                t.doc.body.dispatchEvent(mousedownev);

                t.execCmd(btn.fn || btnName, btn.param || btnName, btn.forceCss);

                return false;
            });
            
            return subbutton;
        },
        // Check if button is supported
        isSupportedBtn: function () {
            /*try {
                return this.btnsDef[b].isSupported;
            } catch (c) {
                console.error(c);
            }*/
            return true;
        },

        // Build overlay for modal box
        buildOverlay: function () {
            var t = this;
            t.$overlay = t.doc.createElement('div');
            t.$overlay.className = t.o.prefix + 'overlay';
            t.$box.appendChild(t.$overlay);

            return t.$overlay;
        },
        showOverlay: function () {
            var t = this;
            var scrollev = new CustomEvent('scroll');
            window.dispatchEvent(scrollev);
            t.$overlay.style.display = 'block';
            t.$box.classList.add(t.o.prefix + 'box-blur');
        },
        hideOverlay: function () {
            var t = this;
            t.$overlay.style.display = 'none';
            t.$box.classList.remove(t.o.prefix + 'box-blur');
        },
 
        windowScrollHandler: function () {
            var t = this,
                fixedFullWidth = t.o.fixedFullWidth,
                $box = t.$box;
            
            if (!$box) {
                return;
            }

            t.syncCode();

            var scrollTop = window.scrollTop(),
                offset = $box.offset().top + 1,
                bp = t.$btnPane,
                oh = bp.offsetHeight - 2;
            var findtoprefix = $box.querySelector('.' + t.o.prefix + 'fixed-top');

            if ((scrollTop - offset > 0) && ((scrollTop - offset - t.height) < 0)) {
                if (!t.isFixed) {
                    t.isFixed = true;
                    bp.style.position = 'fixed';
                    bp.style.top = 0;
                    bp.style.left = fixedFullWidth ? '0' : 'auto';
                    bp.style.zIndex = 7;
        
                    t.$ta.style.marginTop = bp.clientHeight;
                    t.$ed.style.marginTop = bp.clientHeight;
                }
                bp.style.width = fixedFullWidth ? '100%' : (($box.width() - 1) + 'px');

                findtoprefix.style.position = fixedFullWidth ? 'fixed' : 'absolute';
                findtoprefix.style.top = fixedFullWidth ? oh : oh + (scrollTop - offset) + 'px';
                findtoprefix.style.zIndex = 15;
            } else if (t.isFixed) {
                t.isFixed = false;
                bp.removeAttribute('style');
                t.$ta.style.marginTop = 0;
                t.$ed.style.marginTop = 0;

                findtoprefix.style.position = 'absolute';
                findtoprefix.style.top = oh;
            }
        },

        // Management of fixed button pane
        fixedBtnPaneEvents: function () {
            var t = this;

            if (!t.o.fixedBtnPane) {
                return;
            }

            t.isFixed = false;
            
            window.addEventListener('scroll.' + t.eventNamespace, t.windowScrollHandler);
            window.addEventListener('resize.' + t.eventNamespace, t.windowScrollHandler);
        },

        // Disable editor
        setDisabled: function (disable) {
            var t = this,
                prefix = t.o.prefix;

            t.disabled = disable;

            if (disable) {
                t.$ta.setAttribute('disabled', 'disabled');
            } else {
                t.$ta.removeAttribute('disabled');
            }
            t.$box.classList.toggle(prefix + 'disabled', disable);
            t.$ed.contentEditable = !disable;
        },

        // Destroy the editor
        destroy: function () {
            var t = this,
                prefix = t.o.prefix;

            if (t.isTextarea) {
                t.$ta.height = '';
                t.$ta.value = '';
                t.$ta.classList.remove(prefix + 'textarea');
                t.$ta.style.display = 'block';
                t.$box.parentNode.insertBefore(t.$ta, t.$box.nextSibling);
            } else {
                t.$ed.height = '';
                t.$ed.classList.remove(prefix + 'editor');
                t.$ed.contentEditable = false;
                t.$ed.removeAttribute('dir');
                t.$ed.innerHTML = t.html();
                t.$ed.style.display = 'block';
                t.$box.parentNode.insertBefore(t.$ed, t.$box.nextSibling);
            }

            t.$ed.removeEventListener('dblclick', t.o.imgDblClickHandler);

            t.destroyPlugins();

            t.$box.remove();
            delete t.$c.dataset.trumbowyg;
            document.body.classList.remove(prefix + 'body-fullscreen');
            var tbwcloseev = new CustomEvent('tbwclose');
            t.$c.dispatchEvent(tbwcloseev);
            
            window.removeEventListener('scroll.' + t.eventNamespace, t.windowScrollHandler);
            window.removeEventListener('resize.' + t.eventNamespace, t.windowScrollHandler);
        },


        // Empty the editor
        empty: function () {
            this.$ta.value = '';
            this.syncCode(true);
        },


        // Function call when click on viewHTML button
        toggle: function () {
            var t = this,
                prefix = t.o.prefix;

            if (t.o.autogrowOnEnter) {
                t.autogrowOnEnterDontClose = !t.$box.classList.contains(prefix + 'editor-hidden');
            }

            t.semanticCode(false, true);

            setTimeout(function () {
                t.doc.activeElement.blur();
                t.$box.classList.toggle(prefix + 'editor-hidden ' + prefix + 'editor-visible');
                t.$btnPane.classList.toggle(prefix + 'disable');
                let htmlbtn = t.doc.querySelector('.' + prefix + 'viewHTML-button', t.$btnPane);
                if (htmlbtn) {
                    htmlbtn.classList.toggle(prefix + 'active');
                }
                if (t.$box.hasClass(prefix + 'editor-visible')) {
                    t.$ta.setAttribute('tabindex', -1);
                } else {
                    t.$ta.removeAttribute('tabindex');
                }

                if (t.o.autogrowOnEnter && !t.autogrowOnEnterDontClose) {
                    t.autogrowEditorOnEnter();
                }
            }, 0);
        },

        // Open dropdown when click on a button which open that
        dropdown: function (name) {
            var t = this,
                d = t.doc,
                prefix = t.o.prefix,
                $dropdown = t.$box.querySelector('[data-' + prefix + 'dropdown=' + name + ']'),
                $btn = t.$btnPane.querySelector('.' + prefix + name + '-button'),
                show = $dropdown.getAttribute('hidden') === 'hidden';

            var mousedowneev = new CustomEvent('mousedown');
            d.body.dispatchEvent(mousedowneev);

            if (show) {
                var o = $btn.offsetLeft;
                $btn.addClass(prefix + 'active');

                $dropdown.style.position = 'absolute';
                $dropdown.style.top = $btn.offsetTop - t.$btnPane.offsetTop + $btn.offsetHeight;
                $dropdown.style.left = (t.o.fixedFullWidth && t.isFixed) ? o + 'px' : (o - t.$btnPane.offsetLeft) + 'px';
                $dropdown.style.display = 'block';

                var scrollev = new CustomEvent('scroll');
                window.dispatchEvent('scroll');
                
                var dropdownTargetHandler = function(e) {
                    if (!$dropdown === e.target) {
                        let dropdown = t.$box.querySelector('.' + prefix + 'dropdown');
                        if (dropdown) {
                            t.$box.querySelector('.' + prefix + 'dropdown').display = 'none';
                        }
                        let activePaneButton = t.$btnPane.querySelector('.' + prefix + 'active', t.$btnPane);
                        if (activePaneButton) {
                            activePaneButton.classList.remove(prefix + 'active');
                        }
                        d.body.removeEventListener('mousedown.' + t.eventNamespace, scrollev);
                    }
                };

                d.body.addEventListener('mousedown.' + t.eventNamespace, dropdownTargetHandler);
            }
        },


        // HTML Code management
        html: function (html) {
            var t = this;

            if (html != null) {
                t.$ta.value = html;
                t.syncCode(true);
                var tbwchangeev = new CustomEvent('tbwchange');
                t.$c.dispatchEvent(tbwchangeev);
                return t;
            }

            return t.$ta.value;
        },
        syncTextarea: function () {
            var t = this;
            t.$ta.value = 
                t.$ed.innerText.trim().length > 0 || t.$ed.querySelector('hr,img,embed,iframe,input') ? t.$ed.innerHTML : '';
        },
        syncCode: function (force) {
            var t = this;
            if (!force && t.$ed.style !== 'none') {
                t.syncTextarea();
            } else {
                // wrap the content in a div it's easier to get the innerhtml
                var html = t.doc.createElement('div');
                html.innerHTML = t.$ta.value;

                //scrub the html before loading into the doc
                var safe = t.doc.createElement('html');
                safe.appendChild(html);
                var rmtags = safe.querySelectorAll(t.o.tagsToRemove.join(','));
                for (var i = 0; i < rmtags.length; i++) {
                    rmtags[i].remove();
                }

                t.$ed.innerHTML(safe.innerHTML);
            }

            if (t.o.autogrow) {
                t.height = t.$ed.style.height;
                if (t.height !== t.$ta.style.height) {
                    t.$ta.style.height = t.height;
                    
                    var tbwresizeev = new CustomEvent('tbwresize');
                    t.$c.dispatchEvent(tbwresizeev);
                }
            }
            if (t.o.autogrowOnEnter) {
                // t.autogrowEditorOnEnter();
                t.$ed.style.height = 'auto';
                var totalheight = t.autogrowOnEnterWasFocused ? t.$ed[0].scrollHeight : t.$ed.style.minHeight;
                if (totalheight !== t.$ta.css('height')) {
                    t.$ed.style.height = totalheight;
                    t.$c.dispatchEvent(new CustomEvent('tbwresize'));
                }
            }
        },

        // Analyse and update to semantic code
        // @param force : force to sync code from textarea
        // @param full  : wrap text nodes in <p>
        // @param keepRange  : leave selection range as it is
        semanticCode: function (force, full, keepRange) {
            var t = this;
            t.saveRange();
            t.syncCode(force);

            if (t.o.semantic) {
                t.semanticTag('b');
                t.semanticTag('i');
                t.semanticTag('s');
                t.semanticTag('strike');

                if (full) {
                    var inlineElementsSelector = t.o.inlineElementsSelector;

                    // Wrap text nodes in span for easier processing
                    for (let edc of t.$ed.childNodes)  {
                        if (edc.nodeType === 3 && edc.nodeValue.trim().length > 0) {
                            var pwrapper = t.doc.createElement('span');
                            pwrapper.dataset.tbw = 1;
                            edc.parentNode.insertBefore(pwrapper, edc),
                            pwrapper.appendChild(edc);
                        }
                    }

                    // Wrap groups of inline elements in paragraphs (recursive)
                    var wrapInlinesInParagraphsFrom = function ($from) {
                        if ($from !== null) {
                            var curPara = $from;
                            while (curPara !== null && curPara.querySelector(inlineElementsSelector) !== null) {
                                var pwrapper = t.doc.createElement('p');
                                curPara.parentNode.insertBefore(pwrapper, curPara),
                                pwrapper.appendChild(curPara);
                                curPara = curPara.nextSibling;
                            }
                            
                            var $finalParagraph;
                            var $nextElement;
                            
                            if (curPara !== null) {
                                $finalParagraph = curPara.parentNode;

                                while (curPara !== null && !curPara.querySelector(inlineElementsSelector)) {
                                    curPara = curPara.nextSibling;
                                }
                                $nextElement = curPara;
                            
                                curPara = $finalParagraph;
                                if (curPara !== null) {
                                    while (curPara !== null && !curPara.querySelector('br')) {
                                        curPara = curPara.nextSibling;
                                    }
                                    
                                    if (curPara !== null && curPara.nodeName.toLowerCase() === 'br') {
                                        curPara.remove();
                                    }
                                }

                                if ($nextElement !== null) {
                                    wrapInlinesInParagraphsFrom($nextElement);
                                }
                            }
                        }
                    };
                    
                    wrapInlinesInParagraphsFrom(t.$ed.querySelector(inlineElementsSelector));

                    t.semanticTag('div', true);

                    // Unwrap paragraphs content, containing nothing usefull
                    var uselessPara = t.$ed.querySelectorAll('p');
                    var filUselessPara = [];
                    
                    for (let p of uselessPara) {
                        // Don't remove currently being edited element
                        if (t.range && p === t.range.startContainer) {
                            continue;
                        }
                        
                        if (p.innerText.trim().length === 0 &&
                            !p.querySelector(':not(br):not(span)')) {
                            filUselessPara.push(p);
                        }
                    }
                    
                    //Unwrap the paragraphs
                    for (let up of filUselessPara) {
                        for (let upc of up.childNodes) {
                            let docFrag = document.createDocumentFragment();
                            while (upc.firstChild) {
                                let child = upc.removeChild(upc.firstChild);
                                docFrag.appendChild(child);
                            }

                            // replace wrapper with document fragment
                            upc.parentNode.replaceChild(docFrag, upc);
                        }
                    }

                    // Get rid of temporial span's
                    let tempspans = t.$ed.querySelectorAll('[data-tbw]');
                    for (let ts of tempspans) {
                        let docFrag = document.createDocumentFragment();
                        while (ts.firstChild) {
                            let child = ts.removeChild(ts.firstChild);
                            docFrag.appendChild(child);
                        }

                        // replace wrapper with document fragment
                        ts.parentNode.replaceChild(docFrag, ts);
                    }

                    // Remove empty <p>
                    let emptyEles = t.$ed.querySelectorAll('p:empty');
                    for (let ee of emptyEles) {
                        ee.remove();
                    }
                }

                if (!keepRange) {
                    t.restoreRange();
                }

                t.syncTextarea();
            }
        },

        semanticTag: function (oldTag, copyAttributes) {
            var newTag;

            if (this.o.semantic != null && typeof this.o.semantic === 'object' && this.o.semantic.hasOwnProperty(oldTag)) {
                newTag = this.o.semantic[oldTag];
            } else if (this.o.semantic === true && this.DEFAULT_SEMANTIC_MAP.hasOwnProperty(oldTag)) {
                newTag = this.DEFAULT_SEMANTIC_MAP[oldTag];
            } else {
                return;
            }

            var oldTags = this.$ed.querySelectorAll(oldTag);
            
            for (let $oldTag of oldTags) {
                let pwrapper = this.doc.createElement(newTag);
                $oldTag.parentNode.insertBefore(pwrapper, $oldTag),
                pwrapper.appendChild($oldTag);
                
                if (copyAttributes) {
                    for (let [attrkey, attrval] of $oldTag.attributes) {
                        $oldTag.parentNode.setAttribute(attrkey, attrval);
                    }
                }
                
                //Unwrap
                let docFrag = document.createDocumentFragment();
                while ($oldTag.firstChild) {
                    var child = $oldTag.removeChild($oldTag.firstChild);
                    docFrag.appendChild(child);
                }

                // replace wrapper with document fragment
                $oldTag.parentNode.replaceChild(docFrag, $oldTag);
            }
        },

        // Function call when user click on "Insert Link"
        createLink: function () {
            var t = this,
                documentSelection = t.doc.getSelection(),
                node = documentSelection.focusNode,
                text = new XMLSerializer().serializeToString(documentSelection.getRangeAt(0).cloneContents()),
                url,
                title,
                target;

            while (['A', 'DIV'].indexOf(node.nodeName) < 0) {
                node = node.parentNode;
            }

            if (node && node.nodeName === 'A') {
                var $a = node;
                text = $a.innerText;
                url = $a.getAttribute('href');
                if (!t.o.minimalLinks) {
                    title = $a.getAttribute('title');
                    target = $a.getAttribute('target');
                }
                var range = t.doc.createRange();
                range.selectNode(node);
                documentSelection.removeAllRanges();
                documentSelection.addRange(range);
            }

            t.saveRange();

            var options = {
                url: {
                    label: 'URL',
                    required: true,
                    value: url
                },
                text: {
                    label: t.lang.text,
                    value: text
                }
            };
            if (!t.o.minimalLinks) {
                Object.assign(options, {
                    title: {
                        label: t.lang.title,
                        value: title
                    },
                    target: {
                        label: t.lang.target,
                        value: target
                    }
                });
            }

            t.openModalInsert(t.lang.createLink, options, function (v) { // v is value
                var url = t.prependUrlPrefix(v.url);
                if (!url.length) {
                    return false;
                }

                var link = t.doc.createElement('a');
                link.setAttribute('href', url);
                link.appendChild(t.doc.createTextNode(v.text || v.url));

                if (!t.o.minimalLinks) {
                    if (v.title.length > 0) {
                        link.setAttribute('title', v.title);
                    }
                    if (v.target.length > 0) {
                        link.setAttribute('target', v.target);
                    }
                }
                t.range.deleteContents();
                t.range.insertNode(link[0]);
                t.syncCode();
                t.$c.dispatchEvent(new CustomEvent('tbwchange'));
                return true;
            });
        },
        prependUrlPrefix: function (url) {
            var t = this;
            if (!t.urlPrefix) {
                return url;
            }

            var VALID_LINK_PREFIX = /^([a-z][-+.a-z0-9]*:|\/|#)/i;
            if (VALID_LINK_PREFIX.test(url)) {
                return url;
            }

            var SIMPLE_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (SIMPLE_EMAIL_REGEX.test(url)) {
                return 'mailto:' + url;
            }

            return t.urlPrefix + url;
        },
        unlink: function () {
            var t = this,
                documentSelection = t.doc.getSelection(),
                node = documentSelection.focusNode;

            if (documentSelection.isCollapsed) {
                while (['A', 'DIV'].indexOf(node.nodeName) < 0) {
                    node = node.parentNode;
                }

                if (node && node.nodeName === 'A') {
                    var range = t.doc.createRange();
                    range.selectNode(node);
                    documentSelection.removeAllRanges();
                    documentSelection.addRange(range);
                }
            }
            t.execCmd('unlink', undefined, undefined, true);
        },
        insertImage: function () {
            var t = this;
            t.saveRange();

            var options = {
                url: {
                    label: 'URL',
                    required: true
                },
                alt: {
                    label: t.lang.description,
                    value: t.getRangeText()
                }
            };

            if (t.o.imageWidthModalEdit) {
                options.width = {};
            }

            t.openModalInsert(t.lang.insertImage, options, function (v) { // v are values
                t.execCmd('insertImage', v.url);
                var $img = t.$box.querySelector('img[src="' + v.url + '"]:not([alt])');
                $img.setAttribute('alt', v.alt);

                if (t.o.imageWidthModalEdit) {
                    $img.setAttribute('width', v.width);
                }

                t.syncCode();
                t.$c.dispatchEvent(new CustomEvent('tbwchange'));

                return true;
            });
        },
        fullscreen: function () {
            var t = this,
                prefix = t.o.prefix,
                fullscreenCssClass = prefix + 'fullscreen',
                isFullscreen;

            t.$box.classList.toggle(fullscreenCssClass);
            isFullscreen = t.$box.classList.contains(fullscreenCssClass);
            t.doc.body.classList.toggle(prefix + 'body-fullscreen', isFullscreen);
            window.dispatchEvent(new CustomEvent('scroll'));
            t.$c.dispatchEvent(new CustomEvent('tbw' + (isFullscreen ? 'open' : 'close') + 'fullscreen'));
        },


        /*
         * Call method of trumbowyg if exist
         * else try to call anonymous function
         * and finaly native execCommand
         */
        execCmd: function (cmd, param, forceCss, skipTrumbowyg) {
            var t = this;
            skipTrumbowyg = !!skipTrumbowyg || '';

            if (cmd !== 'dropdown') {
                t.$ed.focus();
            }

            try {
                t.doc.execCommand('styleWithCSS', false, forceCss || false);
            } catch (c) {
                console.error(c);
            }

            try {
                t[cmd + skipTrumbowyg](param);
            } catch (c) {
                try {
                    cmd(param);
                } catch (e2) {
                    if (cmd === 'insertHorizontalRule') {
                        param = undefined;
                    } else if (cmd === 'formatBlock' && t.isIE) {
                        param = '<' + param + '>';
                    }

                    t.doc.execCommand(cmd, false, param);

                    t.syncCode();
                    t.semanticCode(false, true);
                }

                if (cmd !== 'dropdown') {
                    t.updateButtonPaneStatus();
                    t.$c.dispatchEvent(new CustomEvent('tbwchange'));
                }
            }
        },


        cancelModalHandler: function () {
            let openedModal = this.doc.querySelector(this.o.prefix + 'modal');
            if (openedModal) {
                openedModal.dispatchEvent(new CustomEvent(CANCEL_EVENT));
            }
            this.$overlay.removeEventListener('click', this.cancelModalHandler);
            return false;
        },
        // Open a modal box
        openModal: function (title, content) {
            var t = this,
                prefix = t.o.prefix;

            // No open a modal box when exist other modal box
            if (t.$box.querySelector('.' + prefix + 'modal-box')) {
                return false;
            }
            if (t.o.autogrowOnEnter) {
                t.autogrowOnEnterDontClose = true;
            }

            t.saveRange();
            t.showOverlay();

            // Disable all btnPane btns
            t.$btnPane.classList.add(prefix + 'disable');

            // Build out of ModalBox, it's the mask for animations
            var $modal = t.doc.createElement('div');
            $modal.className = prefix + 'modal ' + prefix + 'fixed-top';
            $modal.style.top = t.$btnPane.style.height;
            t.$box.appendChild($modal);

            // Click on overlay close modal by cancelling them
            t.$overlay.addEventListener('click', t.cancelModalHandler);

            // Build the form
            var $form = t.doc.createElement('form');
            $form.setAttribute('action', '');
            $form.innerHTML = content;
            $form.addEventListener('submit', function () {
                $modal.dispatchEvent(new CustomEvent(CONFIRM_EVENT));
            });
            $form.addEventListener('reset', function () {
                $modal.dispatchEvent(new CustomEvent(CANCEL_EVENT));
                return false;
            });
            $form.addEventListener('submit', function () {
                if (t.o.autogrowOnEnter) {
                    t.autogrowOnEnterDontClose = false;
                }
            });
            $form.addEventListener('reset', function () {
                if (t.o.autogrowOnEnter) {
                    t.autogrowOnEnterDontClose = false;
                }
            });

            // Build ModalBox and animate to show them
            var $box = t.doc.createElement('div');
            $box.className = prefix + 'modal-box';
            $box.appendChild($form);
            $box.style.top = '-' + t.$btnPane.offsetHeight + 'px';
            $box.style.opacity = 0;
            $modal.appendChild($box);

            // Append title
            var titlespan = t.doc.createElement('span');
            titlespan.setAttribute('text', title);
            titlespan.className = prefix + 'modal-title';
            $box.insertBefore(titlespan, $form);

            $modal.style.height = $box.offsetHeight + 10;

            // Focus in modal box
            let firstInput = $box.querySelector('input:first');
            if (firstInput) {
                firstInput.focus();
            }

            // Append Confirm and Cancel buttons
            t.buildModalBtn('submit', $box);
            t.buildModalBtn('reset', $box);


            window.dispatchEvent(new CustomEvent('scroll'));

            return $modal;
        },
        // @param n is name of modal
        buildModalBtn: function (n, $modal) {
            var t = this,
                prefix = t.o.prefix;

            var modalButton = t.doc.createElement('button');
            modalButton.className = prefix + 'modal-button ' + prefix + 'modal-' + n;
            modalButton.setAttribute('type', n);
            modalButton.innerText = t.lang[n] || n;
            let form = $modal.querySelector('form');
            if (form) {
                form.appendChild(modalButton);
            }
            return modalButton;
        },
        // close current modal box
        closeModal: function () {
            var t = this,
                prefix = t.o.prefix;

            t.$btnPane.classList.remove(prefix + 'disable');
            t.$overlay.removeEventListener('click', t.cancelHandler);

            // Find the modal box
            var $modalBox = t.$box.querySelector('.' + prefix + 'modal-box');

            $modalBox.parentNode.remove();
            t.hideOverlay();

            t.restoreRange();
        },
        // Preformated build and management modal
        openModalInsert: function (title, fields, cmd) {
            var t = this,
                prefix = t.o.prefix,
                lg = t.lang,
                html = '';

            for (let [fieldName, field] of fields) {
                var l = field.label || fieldName,
                    n = field.name || fieldName,
                    a = field.attributes || {};

                var attr = Object.keys(a).map(function (prop) {
                    return prop + '="' + a[prop] + '"';
                }).join(' ');

                html += '<label><input type="' + (field.type || 'text') + '" name="' + n + '"' +
                    (field.type === 'checkbox' && field.value ? ' checked="checked"' : ' value="' + (field.value || '').replace(/"/g, '&quot;')) +
                    '"' + attr + '><span class="' + prefix + 'input-infos"><span>' +
                    (lg[l] ? lg[l] : l) +
                    '</span></span></label>';
            }

            var theOpenModal = t.openModal(title, html);
            function confirmHandler (ev) {
                var $form = ev.target.querySelector('form'),
                    valid = true,
                    values = {};

                for (let [fieldName, field] of fields) {
                    var n = field.name || fieldName;

                    var $field = $form.querySelector('input[name="' + n + '"]'),
                        inputType = $field.getAttribute('type');
                    
                    let checkedradio = $field.querySelector(':checked');

                    switch (inputType.toLowerCase()) {
                    case 'checkbox':
                        values[n] = $field.getAttribute('checked');
                        break;
                    case 'radio':
                        if (checkedradio) {
                            values[n] = checkedradio.value;
                        }
                        break;
                    default:
                        values[n] = $field.value.trim();
                        break;
                    }
                    // Validate value
                    if (field.required && values[n] === '') {
                        valid = false;
                        t.addErrorOnModalField($field, t.lang.required);
                    } else if (field.pattern && !field.pattern.test(values[n])) {
                        valid = false;
                        t.addErrorOnModalField($field, field.patternError);
                    }
                }

                if (valid) {
                    t.restoreRange();

                    if (cmd(values, fields)) {
                        t.syncCode();
                        t.$c.dispatchEvent(new CustomEvent('tbwchange'));
                        t.closeModal();
                        ev.target.removeEventListener(CONFIRM_EVENT, confirmHandler);
                    }
                }
            }
            theOpenModal.addEventListener(CONFIRM_EVENT, confirmHandler);
            
            function cancelHandler (ev) {
                ev.target.removeEventListener(CONFIRM_EVENT, confirmHandler);
                t.closeModal();
                ev.target.removeEventListener(CANCEL_EVENT, cancelHandler);
            }
            theOpenModal.addEventListener(CANCEL_EVENT, cancelHandler);
    
            return theOpenModal;
        },
        addErrorOnModalField: function ($field, err) {
            var prefix = this.o.prefix,
                $label = $field.parentNode;

            $field.addEventListener('change', function () {
                $label.classList.remove(prefix + 'input-error');
            });
            $field.addEventListener('keyup', function () {
                $label.classList.remove(prefix + 'input-error');
            });

            var errorLabel = $label.classList(prefix + 'input-error');
            var errorSpan = this.doc.createElement('span');
            errorSpan.className = prefix + 'msg-error';
            errorSpan.innerText = err;
            errorLabel.appendChild(errorSpan);
        },

        getDefaultImgDblClickHandler: function (ev) {
            if (ev.target.nodeName.toLowerCase() !== 'img') {
                return;
            }
            var t = this;

            return function () {
                var $img = ev.target,
                    src = $img.getAttribute('src'),
                    base64 = '(Base64)';

                if (src.indexOf('data:image') === 0) {
                    src = base64;
                }

                var options = {
                    url: {
                        label: 'URL',
                        value: src,
                        required: true
                    },
                    alt: {
                        label: t.lang.description,
                        value: $img.getAttribute('alt')
                    }
                };

                if (t.o.imageWidthModalEdit) {
                    options.width = {
                        value: $img.style.width ? $img.style.width : ''
                    };
                }

                t.openModalInsert(t.lang.insertImage, options, function (v) {
                    if (v.url !== base64) {
                        $img.setAttribute('src', v.url);
                    }
                    $img.attr({
                        alt: v.alt
                    });

                    if (t.o.imageWidthModalEdit) {
                        if (parseInt(v.width) > 0) {
                            $img.style.width = v.width;
                        } else {
                            $img.style.width = 'auto';
                        }
                    }

                    return true;
                });
                return false;
            };
        },

        // Range management
        saveRange: function () {
            var t = this,
                documentSelection = t.doc.getSelection();

            t.range = null;

            if (documentSelection.rangeCount) {
                var savedRange = t.range = documentSelection.getRangeAt(0),
                    range = t.doc.createRange(),
                    rangeStart;
                range.selectNodeContents(t.$ed);
                range.setEnd(savedRange.startContainer, savedRange.startOffset);
                rangeStart = (range + '').length;
                t.metaRange = {
                    start: rangeStart,
                    end: rangeStart + (savedRange + '').length
                };
            }
        },
        restoreRange: function () {
            var t = this,
                metaRange = t.metaRange,
                savedRange = t.range,
                documentSelection = t.doc.getSelection(),
                range;

            if (!savedRange) {
                return;
            }

            if (metaRange && metaRange.start !== metaRange.end) { // Algorithm from http://jsfiddle.net/WeWy7/3/
                var charIndex = 0,
                    nodeStack = [t.$ed[0]],
                    node,
                    foundStart = false,
                    stop = false;

                range = t.doc.createRange();

                while (!stop && (node = nodeStack.pop())) {
                    if (node.nodeType === 3) {
                        var nextCharIndex = charIndex + node.length;
                        if (!foundStart && metaRange.start >= charIndex && metaRange.start <= nextCharIndex) {
                            range.setStart(node, metaRange.start - charIndex);
                            foundStart = true;
                        }
                        if (foundStart && metaRange.end >= charIndex && metaRange.end <= nextCharIndex) {
                            range.setEnd(node, metaRange.end - charIndex);
                            stop = true;
                        }
                        charIndex = nextCharIndex;
                    } else {
                        var cn = node.childNodes,
                            i = cn.length;

                        while (i > 0) {
                            i -= 1;
                            nodeStack.push(cn[i]);
                        }
                    }
                }
            }

            documentSelection.removeAllRanges();
            documentSelection.addRange(range || savedRange);
        },
        getRangeText: function () {
            return this.range + '';
        },

        updateButtonPaneStatus: function () {
            var t = this,
                prefix = t.o.prefix,
                tags = t.getTagsRecursive(t.doc.getSelection().focusNode),
                activeClasses = prefix + 'active-button ' + prefix + 'active';

            let activePaneButton = t.$btnPane.querySelector('.' + prefix + 'active-button');
            if (activePaneButton) {
                activePaneButton.classList.remove(activeClasses);
            }
            for (var tag of tags) {
                var btnName = t.tagToButton[tag.toLowerCase()],
                    $btn = t.$btnPane.querySelector('.' + prefix + btnName + '-button');

                if ($btn) {
                    $btn.addClass(activeClasses);
                } else {
                    $btn = t.$box.querySelector('.' + prefix + 'dropdown .' + prefix + btnName + '-dropdown-button');
                    if ($btn) {
                        let dropdownBtnName = $btn.parentNode.datasetdropdown;
                        let dropdownButton = t.$box.querySelector('.' + prefix + dropdownBtnName + '-button');
                        if (dropdownButton) {
                            dropdownButton.classList.add(activeClasses);
                        }
                    }
                }
            }
        },
        getTagsRecursive: function (element, tags) {
            var t = this;
            tags = tags || (element && element.tagName ? [element.tagName] : []);

            if (element && element.parentNode) {
                element = element.parentNode;
            } else {
                return tags;
            }

            var tag = element.tagName;
            if (tag === 'DIV') {
                return tags;
            }
            if (tag === 'P' && element.style.textAlign !== '') {
                tags.push(element.style.textAlign);
            }

            for (var tagHandler of t.tagHandlers) {
                tags = tags.concat(tagHandler(element, t));
            }

            tags.push(tag);

            return t.getTagsRecursive(element, tags).filter(function (tag) {
                return tag != null;
            });
        },

        // Plugins
        initPlugins: function () {
            var t = this;
            t.loadedPlugins = [];
            for (let plugin of Object.values(trumbowyg.plugins)) {
                if (!plugin.shouldInit || plugin.shouldInit(t)) {
                    plugin.init(t);
                    if (plugin.tagHandler) {
                        t.tagHandlers.push(plugin.tagHandler);
                    }
                    t.loadedPlugins.push(plugin);
                }
            }
        },
        destroyPlugins: function () {
            for (var plugin of this.loadedPlugins) {
                if (plugin.destroy) {
                    plugin.destroy();
                }
            }
        }
    };
})(navigator, window, document, trumbowyg, activeTrumbowygs);
