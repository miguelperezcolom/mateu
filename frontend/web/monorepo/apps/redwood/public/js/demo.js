require([
        "require",
        "exports",
        "knockout",
        "ojs/ojbootstrap",
        "jet-composites/demo-card/loader",
        "ojs/ojknockout"
    ],
    function (require, exports, ko, ojbootstrap_1) {
        "use strict";

        class Model {
        }

        // initial binding, after the ui is painted
        (0, ojbootstrap_1.whenDocumentReady)().then(() => {
            const elements = document.getElementsByTagName('mateu-component');
            for (let i = 0; i < elements.length; i++) {
                const element = elements.item(i);
                console.log('binding element', element);
                try {
                    console.log('cleaning node');
                    ko.cleanNode(element);
                } catch (e) {
                    console.log('not cleanable');
                }
                console.log('applying bindings');
                ko.applyBindings({}, element);
            }
        });
    }
);

