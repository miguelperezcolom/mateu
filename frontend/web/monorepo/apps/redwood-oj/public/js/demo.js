require([
            "require",
            "exports",
            "knockout",
            "ojs/ojbootstrap",
            "jet-composites/demo-card/loader",
            "ojs/ojknockout",
            "oj-c/button/button",
            "oj-c/input-text/input-text",
            "oj-c/input-number/input-number",
            "oj-c/input-password/input-password",
            "oj-c/text-area/text-area",
            "oj-c/input-date-text/input-date-text",
            "oj-c/input-date-picker/input-date-picker",
            "oj-c/input-time-mask/input-time-mask",
            "oj-c/select-single/select-single",
            "oj-c/select-multiple/select-multiple",
            "oj-c/checkbox/checkbox",
            "oj-c/checkboxset/checkboxset",
            "oj-c/radioset/radioset",
            "oj-c/toggle-button/toggle-button",
            "oj-c/file-picker/file-picker",
            "oj-c/drawer-layout/drawer-layout",
            "oj-c/tab-bar/tab-bar",
            "oj-c/avatar/avatar",
            "oj-c/table/table",
            "oj-c/badge/badge",
            "oj-c/menu-button/menu-button",
            "oj-c/progress-bar/progress-bar",
            "oj-c/rating-gauge/rating-gauge",
            "oj-c/collapsible/collapsible",
            "ojs/ojarraydataprovider"
        ],
        function (require, exports, ko, ojbootstrap_1) {
            "use strict";

            // Tell OJ to use the Preact binding provider for all VComponents (oj-c-*).
            // Without this, _walkBindingProviders reaches <html> and defaults to "knockout",
            // which causes the creation promise to never resolve (ojknockout.js does not call
            // resolveBindingProvider for oj-c-* VComponents).
            document.body.setAttribute("data-oj-binding-provider", "preact");

            (0, ojbootstrap_1.whenDocumentReady)().then(() => {

                const container = document.getElementById("ui-container");
                const ui = document.createElement('mateu-ui');
                ui.setAttribute("baseUrl", "");
                ui.setAttribute("urlPrefix", "");
                ui.setAttribute("config", '{"tenantId": "1111","profile": "dev"}');
                ui.setAttribute("style", "display: block; width: 100%; height: calc(100vh - 100px);");
                container?.appendChild(ui);

                document.getElementById("page-container").style.display = 'block';
                document.getElementById("landing-loader").style.display = 'none';

            });
        }
    );
