import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { SapUi5ComponentRenderer } from "./SapUi5ComponentRenderer";
import '@infra/ui/mateu-ui'


import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Button.js"; // ui5-button
import "@ui5/webcomponents/dist/Input.js"; // ui5-input
import "@ui5/webcomponents/dist/List.js"; // ui5-list
import "@ui5/webcomponents/dist/ListItemStandard.js"; // ui5-li
import "@ui5/webcomponents-fiori/dist/Wizard.js"; // ui5-wizard


componentRenderer.set(new SapUi5ComponentRenderer())