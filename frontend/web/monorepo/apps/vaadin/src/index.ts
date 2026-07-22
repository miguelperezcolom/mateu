import './vaadinElements'  // register the Vaadin custom elements (moved out of the shared core)
import '@infra/ui/mateu-ui'
import { VaadinComponentRenderer } from "./VaadinComponentRenderer";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";
import { setNotifier } from "@application/Notifier.ts";
import { vaadinNotifier } from "./VaadinNotifier";

componentRenderer.set(new VaadinComponentRenderer())
// Override the DS-neutral default toast with the Vaadin-fidelity one.
setNotifier(vaadinNotifier)