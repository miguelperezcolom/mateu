import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { RedhatComponentRenderer } from "./RedhatComponentRenderer.ts";
import '@infra/ui/mateu-ui'

componentRenderer.set(new RedhatComponentRenderer())