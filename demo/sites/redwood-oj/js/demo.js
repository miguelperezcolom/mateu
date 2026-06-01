console.log('require')

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

            console.log('required done');

                (0, ojbootstrap_1.whenDocumentReady)().then(() => {

                    console.log('add the ui, after all dependencies have been loaded');

                        const container = document.getElementById("ui-container");
                        const ui = document.createElement('mateu-ui');
                        ui.setAttribute("baseUrl", "http://localhost:8301");
                        ui.setAttribute("config", '{"tenantId": "1111","profile": "dev"}');
                        ui.setAttribute("style", "display: block; width: 100%; height: calc(100vh - 100px);");
                        container?.appendChild(ui);

                        console.log('added ui');

                    document.getElementById("page-container").style.display = 'block';
                    document.getElementById("landing-loader").style.display = 'none';

                });
        }
    );

