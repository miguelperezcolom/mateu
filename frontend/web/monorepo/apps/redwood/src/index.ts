import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { RedwoodComponentRenderer } from "./RedwoodComponentRenderer.ts";
import '@infra/ui/mateu-ui'

componentRenderer.set(new RedwoodComponentRenderer())