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

            setTimeout(() => {
                (0, ojbootstrap_1.whenDocumentReady)().then(() => {

                    console.log('initial binding, after the ui is painted');

                    document.addEventListener("DOMContentLoaded", (event) => {
                        console.log("DOM fully loaded and parsed");

                        setTimeout(() => {
                            const container = document.getElementById("ui-container");
                            /*
                            <mateu-ui baseUrl="/fluent"
                    config='{"tenantId": "1111","profile": "dev"}'
                    style="display: block; width: 100%; height: calc(100vh - 100px);"
          >
          </mateu-ui>
                             */
                            const ui = document.createElement('mateu-ui');
                            ui.setAttribute("baseUrl", "/fluent")
                            ui.setAttribute("config", '{"tenantId": "1111","profile": "dev"}')
                            ui.setAttribute("style", "display: block; width: 100%; height: calc(100vh - 100px);")
                            container?.appendChild(ui);

                            console.log('added ui', container, ui);

                            setTimeout(() => {
                                const elements = document.getElementsByTagName('mateu-ui');
                                for (let i = 0; i < elements.length; i++) {
                                    const element = elements.item(i);
                                    setTimeout(() => {
                                        console.log('binding element', element);
                                        try {
                                            console.log('cleaning node');
                                            ko.cleanNode(element);
                                        } catch (e) {
                                            console.log('not cleanable');
                                        }
                                        console.log('applying bindings');
                                        ko.applyBindings({}, element);
                                    }, 1);
                                }
                            }, 500);
                        }, 100);
                    });

                });

            }, 0);
        }
    );

