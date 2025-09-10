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
                        /*
                        <mateu-ui baseUrl="/fluent"
                config='{"tenantId": "1111","profile": "dev"}'
                style="display: block; width: 100%; height: calc(100vh - 100px);"
      >
      </mateu-ui>
                         */
                        const ui = document.createElement('mateu-ui');
                        ui.setAttribute("baseUrl", "/fluent");
                        ui.setAttribute("config", '{"tenantId": "1111","profile": "dev"}');
                        ui.setAttribute("style", "display: block; width: 100%; height: calc(100vh - 100px);");
                        container?.appendChild(ui);

                        console.log('added ui');

                });
        }
    );

