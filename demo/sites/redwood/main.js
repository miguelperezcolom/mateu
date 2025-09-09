/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function _getCDNPath(paths) {
    //var cdnPath = 'https://www.oracle.com/webfolder/technetwork/jet/';
    var cdnPath = '';
    var ojPath = 'js/libs/oj/19.0.0/';
    var thirdpartyPath = 'js/libs/';
    var keys = Object.keys(paths);
    var newPaths = {};
    function _isoj(key) {
        return (key.indexOf('oj') === 0 && key !== 'ojdnd');
    }
    keys.forEach(function (key) {
        newPaths[key] = cdnPath + (_isoj(key) ? ojPath : thirdpartyPath) + paths[key];
    });
    return newPaths;
}


require.config({
    paths: _getCDNPath({
        //ojs: 'debug',
        ojs: 'min',
        ojL10n: 'ojL10n',
        ojtranslations: 'resources',

        'knockout': 'knockout/knockout-3.5.1',
        'jquery': 'jquery/jquery-3.7.1.min',
        'jqueryui-amd': 'jquery/jqueryui-amd-1.14.1.min',
        'text': 'require/text',
        'hammerjs': 'hammer/hammer-2.0.8.min',
        'signals': 'js-signals/signals.min',
        'ojdnd': 'dnd-polyfill/dnd-polyfill-1.0.2.min',
        'css': 'require-css/css.min',
        'css-builder': 'require-css/css-builder',
        'normalize': 'require-css/normalize',
        '@oracle/oraclejet-preact': 'oraclejet-preact/amd',
        'preact': 'preact/dist/preact.umd',
        'preact/hooks': 'preact/hooks/dist/hooks.umd',
        'preact/compat': 'preact/compat/dist/compat.umd',
        'preact/jsx-runtime': 'preact/jsx-runtime/dist/jsxRuntime.umd',
        'proj4': 'proj4js/dist/proj4',
        'touchr': 'touchr/touchr',
        chai: 'chai/chai-4.5.0.min',
        'x/button': 'packs/oj-c/min/button',
        'x/input-text': 'packs/oj-c/min/input-text',
        'x/input-number': 'packs/oj-c/min/input-number',
        'x/form-layout': 'packs/oj-c/min/form-layout',
        'x/navigation-list': 'oj/19.0.0/min/ojnavigationlist',
        'x/drawer-layout': 'packs/oj-c/min/drawer-layout',
        'x/avatar': 'packs/oj-c/min/avatar',
        'x/tab-bar': 'packs/oj-c/min/tab-bar'
    })
});

requirejs.config({
    //baseUrl: '../js',
    baseUrl: '/',
    // Path mappings for the logical module names
    paths: {
    },
    // Shim configurations for modules that do not expose AMD
    shim: {
        jquery: {
            exports: ['jQuery', '$']
        },
        maps: {
            deps: ['jquery', 'i18n'],
        }
    },
    // This section configures the i18n plugin. It is merging the Oracle JET built-in translation
    // resources with a custom translation file.
    // Any resource file added, must be placed under a directory named "nls". You can use a path mapping or you can define
    // a path that is relative to the location of this main.js file.
    config: {
        ojL10n: {
            merge: {
                // 'ojtranslations/nls/ojtranslations': 'resources/nls/menu'
            }
        }
    }
});