import { RedwoodOjComponentRenderer } from "./RedwoodOjComponentRenderer.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

componentRenderer.set(new RedwoodOjComponentRenderer())
componentRenderer.setUseShadowRoot(false)
componentRenderer.setAfterRenderHook((_element: HTMLElement) => {
    /*
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
                "oj-c/drawer-layout/drawer-layout",
                "oj-c/tab-bar/tab-bar",
                "oj-c/avatar/avatar",
                "oj-c/table/table",
                "ojs/ojarraydataprovider"
            ],
            function (_req: any, _exports: any, ko: any, _ojbootstrap_1: any) {
                "use strict";

                // THIS IS NEEDED FOR RENDERING NEW CONTENT
                try {
                    ko.cleanNode(element);
                } catch (e) {
                    console.log('not cleanable');
                }
                ko.applyBindings({}, element);
            }
        );

     */
})
