import { componentRenderer } from '@infra/ui/renderers/ComponentRenderer'
import { SapUi5ComponentRenderer } from "./SapUi5ComponentRenderer";
import '@infra/ui/mateu-ui'
import './components/mateu-sapui5-form'

import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Button.js"; // ui5-button
import "@ui5/webcomponents/dist/Input.js"; // ui5-input
import "@ui5/webcomponents/dist/List.js"; // ui5-list
import "@ui5/webcomponents/dist/ListItemStandard.js"; // ui5-li
import "@ui5/webcomponents-fiori/dist/Wizard.js"; // ui5-wizard
import "@ui5/webcomponents-fiori/dist/NavigationLayout.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/Text.js";
import "@ui5/webcomponents/dist/TextArea.js";
import "@ui5/webcomponents/dist/Select.js";
import "@ui5/webcomponents/dist/ComboBox.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents/dist/Switch.js";

import "@ui5/webcomponents-fiori/dist/NavigationLayout.js";
import "@ui5/webcomponents-fiori/dist/SideNavigation.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationGroup.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationItem.js";
import "@ui5/webcomponents-fiori/dist/SideNavigationSubItem.js";
import "@ui5/webcomponents-fiori/dist/ShellBar.js";
import "@ui5/webcomponents-fiori/dist/ShellBarBranding.js";
import "@ui5/webcomponents-fiori/dist/ShellBarItem.js";

import "@ui5/webcomponents-icons/dist/home.js";
import "@ui5/webcomponents-icons/dist/group.js";
import "@ui5/webcomponents-icons/dist/menu.js";
import "@ui5/webcomponents-icons/dist/locate-me.js";
import "@ui5/webcomponents-icons/dist/calendar.js";
import "@ui5/webcomponents-icons/dist/history.js";
import "@ui5/webcomponents-icons/dist/source-code.js";
import "@ui5/webcomponents-icons/dist/background.js";
import "@ui5/webcomponents-icons/dist/activity-assigned-to-goal.js";
import "@ui5/webcomponents-icons/dist/action-settings.js";
import "@ui5/webcomponents-icons/dist/chain-link.js";
import "@ui5/webcomponents-icons/dist/document-text.js";
import "@ui5/webcomponents-icons/dist/compare.js";
import "@ui5/webcomponents-icons/dist/locked.js";


import "@ui5/webcomponents-fiori/dist/DynamicPage.js";
import "@ui5/webcomponents-fiori/dist/DynamicPageTitle.js";
import "@ui5/webcomponents-fiori/dist/DynamicPageHeader.js";

import "@ui5/webcomponents/dist/Bar.js";
import "@ui5/webcomponents/dist/Label.js";
import "@ui5/webcomponents/dist/Tag.js";
import "@ui5/webcomponents/dist/Breadcrumbs.js";
import "@ui5/webcomponents/dist/BreadcrumbsItem.js";
import "@ui5/webcomponents/dist/Title.js";
import "@ui5/webcomponents/dist/Toolbar.js";
import "@ui5/webcomponents/dist/ToolbarButton.js";
import "@ui5/webcomponents/dist/Avatar.js";
import "@ui5/webcomponents/dist/Button.js";
import "@ui5/webcomponents/dist/List.js";
import "@ui5/webcomponents/dist/ListItemStandard.js";
import "@ui5/webcomponents/dist/TabContainer.js";
import "@ui5/webcomponents/dist/Tab.js";

import "@ui5/webcomponents-icons/dist/action-settings.js";
import "@ui5/webcomponents-icons/dist/share.js";
import "@ui5/webcomponents-icons/dist/laptop.js";

// Additional components used by new renderers
import "@ui5/webcomponents/dist/CheckBox.js";          // ui5-checkbox
import "@ui5/webcomponents/dist/DatePicker.js";        // ui5-date-picker
import "@ui5/webcomponents/dist/DateTimePicker.js";    // ui5-datetime-picker
import "@ui5/webcomponents/dist/TimePicker.js";        // ui5-time-picker
import "@ui5/webcomponents/dist/Slider.js";            // ui5-slider
import "@ui5/webcomponents/dist/FileUploader.js";      // ui5-file-uploader
import "@ui5/webcomponents/dist/MultiComboBox.js";     // ui5-multi-combobox
import "@ui5/webcomponents/dist/MultiComboBoxItem.js"; // ui5-mcb-item
import "@ui5/webcomponents/dist/ComboBoxItem.js";      // ui5-cb-item
import "@ui5/webcomponents/dist/Option.js";            // ui5-option
import "@ui5/webcomponents/dist/Panel.js";             // ui5-panel (accordion)
import "@ui5/webcomponents/dist/Icon.js";              // ui5-icon
import "@ui5/webcomponents/dist/MessageStrip.js";      // ui5-message-strip (notification)
import "@ui5/webcomponents/dist/ProgressIndicator.js"; // ui5-progress-indicator
import "@ui5/webcomponents/dist/SegmentedButton.js";   // ui5-segmented-button

// Icons used by field and layout renderers
import "@ui5/webcomponents-icons/dist/favorite.js";
import "@ui5/webcomponents-icons/dist/unfavorite.js";
import "@ui5/webcomponents-icons/dist/upload.js";
import "@ui5/webcomponents-icons/dist/question-mark.js";

// SAP UI5 Table components
import "@ui5/webcomponents/dist/Table.js";
import "@ui5/webcomponents/dist/TableHeaderRow.js";
import "@ui5/webcomponents/dist/TableHeaderCell.js";
import "@ui5/webcomponents/dist/TableRow.js";
import "@ui5/webcomponents/dist/TableCell.js";
import "@ui5/webcomponents/dist/TableSelection.js";
import "@ui5/webcomponents/dist/TableGrowing.js";
import "@ui5/webcomponents/dist/Link.js";
import "@ui5/webcomponents-icons/dist/accept.js";
import "@ui5/webcomponents-icons/dist/decline.js";

componentRenderer.set(new SapUi5ComponentRenderer())