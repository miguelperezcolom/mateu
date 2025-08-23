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
                    // ko.cleanNode(element);
                    // ko.applyBindings({}, element);

                    // const elements = document.getElementsByTagName('mateu-component');
                    // for (let i = 0; i < elements.length; i++) {
                    //     const element = elements.item(i);
                    //     console.log('binding element', element)
                    //     if (!!ko.dataFor(element)) {
                    //
                    //     }
                    //     try {
                    //         ko.cleanNode(element);
                    //     } catch (e) {
                    //         console.log('not cleanable');
                    //     }
                    //     ko.applyBindings({}, element);
                    // }
                }
            );

        })
    })
}, 1000)