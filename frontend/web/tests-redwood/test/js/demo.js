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
        constructor() {
            this.employees = [
                {
                    name: 'Deb Raphaely',
                    avatar: '../images/composites/debraphaely.png',
                    title: 'Purchasing Director',
                    work: 5171278899,
                    email: 'deb.raphaely@oracle.com'
                },
                {
                    name: 'Adam Fripp',
                    avatar: null,
                    title: 'IT Manager',
                    work: 6501232234,
                    email: 'adam.fripp@oracle.com'
                }
            ];
        }
    }
    (0, ojbootstrap_1.whenDocumentReady)().then(() => {
        ko.applyBindings(new Model(), document.getElementById('component-container'));
    });
});