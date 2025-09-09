import { RedwoodComponentRenderer } from "./RedwoodComponentRenderer.ts";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

componentRenderer.set(new RedwoodComponentRenderer())
componentRenderer.setUseShadowRoot(false)
setTimeout(() => {
    componentRenderer.setAfterRenderHook((element: HTMLElement) => {
        console.log('after render', element)
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

                    // THIS IS NEEDED FOR RENDERING NEW CONTENT
                    if (true || !!ko.dataFor(element)) {
                            try {
                                console.log('cleaning node')
                                ko.cleanNode(element);
                            } catch (e) {
                                console.log('not cleanable');
                            }
                        console.log('applying bindings')
                            ko.applyBindings({}, element);
                    }
                }
            );

        })
    })
}, 1000)