require([
    "require",
    "exports",
    "knockout",
    "ojs/ojbootstrap",
    "jet-composites/demo-card/loader",
    "ojs/ojknockout"],
    function (require, exports, ko, ojbootstrap_1) {
    "use strict";

    class Model {
    }
    (0, ojbootstrap_1.whenDocumentReady)().then(() => {
        ko.applyBindings(new Model(), document.getElementById('component-container'));
    });
});

