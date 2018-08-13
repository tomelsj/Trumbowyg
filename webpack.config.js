const webpack = require('webpack');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const SpriteLoaderPlugin = require('svg-sprite-loader/plugin');

module.exports = {
    entry: ['./src/assets.js', './src/trumbowyg.js'],
    output: {
        path: __dirname + '/dist',
        publicPath: '../',
        filename: 'trumbowyg.js',
        library: 'trumbowyg'
    },
    mode: 'development',
    module: {
        rules: [
            {
                enforce: 'pre',
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'eslint-loader',
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.(sa|sc|c)ss$/,
                use: [
                    // fallback to style-loader in development
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.svg$/,
                loader: 'svg-sprite-loader',
                options: {
                    symbolId: 'trumbowyg-[name]',
                    extract: true,
                    spriteFilename: 'icons.svg',
                }
            }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: 'trumbowyg.css',
            chunkFilename: 'trumbowyg.css'
        }),
        new SpriteLoaderPlugin({
            plainSprite: true
        })
    ]
}
