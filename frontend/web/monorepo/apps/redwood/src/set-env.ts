import { RedwoodComponentRenderer } from "./RedwoodComponentRenderer.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

componentRenderer.set(new RedwoodComponentRenderer())
componentRenderer.setUseShadowRoot(false)
setTimeout(() => {
    componentRenderer.setAfterRenderHook(() => {
        setTimeout(() => {
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
                    ko.cleanNode(document.getElementById('component-container'));
                    ko.applyBindings({}, document.getElementById('component-container'));
                }
            );

        })
    })
}, 1000)