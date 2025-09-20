import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { RedhatComponentRenderer } from "./RedhatComponentRenderer.ts";
import '@infra/ui/mateu-ui'

import '@rhds/elements/rh-navigation-primary/rh-navigation-primary.js';
import '@rhds/elements/rh-avatar/rh-avatar.js';
import '@rhds/elements/rh-button/rh-button.js';
import "@rhds/elements/rh-icon/rh-icon.js";
import '@rhds/icons/ui/menu-bars.js'
import '@rhds/icons/microns/caret-down.js'

componentRenderer.set(new RedhatComponentRenderer())
componentRenderer.setUseShadowRoot(false)