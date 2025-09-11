import { RedwoodOjComponentRenderer } from "./RedwoodOjComponentRenderer.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

componentRenderer.set(new RedwoodOjComponentRenderer())
componentRenderer.setUseShadowRoot(false)
componentRenderer.setAfterRenderHook((element: HTMLElement) => {
        require([
                "require",
                "exports",
                "knockout",
                "ojs/ojbootstrap",
                "jet-composites/demo-card/loader",
                "ojs/ojknockout"
            ],
            // @ts-ignore
            function (require, exports, ko, ojbootstrap_1) {
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
})
