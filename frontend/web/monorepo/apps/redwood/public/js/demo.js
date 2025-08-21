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

        (0, ojbootstrap_1.whenDocumentReady)().then(() => {
            try {
                ko.cleanNode(document.getElementById('component-container'));
            } catch (e) {
                console.log('not cleanable')
            }
            ko.applyBindings({}, document.getElementById('component-container'));
        });
    }
);

