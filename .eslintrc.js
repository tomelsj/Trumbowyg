module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    "parser": "babel-eslint",
    "extends": [
	    "eslint:recommended"
    ],
    "parserOptions": {
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            4
        ],
        "space-in-parens": [
            "error", 
            "never"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ],
        "keyword-spacing": [
            "error",
            { "after": true }
        ],
        "computed-property-spacing": [
            "error",
            "never"
        ],
        "lines-around-comment": "off",
        "camelcase": "off",
        "no-console": "off",
        "eqeqeq": [
            "error",
            "smart"
        ]
    }
};
