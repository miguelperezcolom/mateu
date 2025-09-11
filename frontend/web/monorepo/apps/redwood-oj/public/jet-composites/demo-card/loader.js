
var requires = {};

define(['ojs/ojarraydataprovider',
        'ojs/ojmutablearraydataprovider',
        'ojs/ojcomposite',
    'x/button',
    'x/input-text',
        'x/input-number',
        'x/form-layout',
    'x/navigation-list',
    'x/drawer-layout',
        'x/avatar',
    'x/tab-bar',
        'x/table'
    ],
    function(ArrayDataProvider, MutableArrayDataProvider, Composite, view, viewModel, metadata) {
        "use strict";

        console.log('ArrayDataProvider', ArrayDataProvider);

        requires.arrayDataProvider = ArrayDataProvider;
        requires.mutableArrayDataProvider = MutableArrayDataProvider;

        console.log('requires x', requires);
    }
);

