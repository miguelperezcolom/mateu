import '@infra/ui/mateu-ui'
import { VaadinComponentRenderer } from "./VaadinComponentRenderer";
import { componentRenderer } from "@infra/ui/renderers/ComponentRenderer.ts";

componentRenderer.set(new VaadinComponentRenderer())