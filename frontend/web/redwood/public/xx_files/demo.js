require(["require"
    , "exports"
    , "knockout"
    , "ojs/ojbootstrap"
    , "knockout"
    , "ojs/ojknockout"
    , "oj-c/button"
    , "oj-c/input-text"



], function (require, exports, ko, Bootstrap) {
    "use strict";
    
    class ButtonModel {
        constructor() {
        }
    }
    Bootstrap.whenDocumentReady().then(() => {
        ko.applyBindings(new ButtonModel(), document.getElementById("buttons-container"));
    });
});
