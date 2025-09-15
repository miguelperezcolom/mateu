import { customElement, property, state } from "lit/decorators.js";
import { css, html, LitElement, nothing, TemplateResult } from "lit";
import '@vaadin/horizontal-layout'
import '@vaadin/vertical-layout'
import '@vaadin/form-layout'
import '@vaadin/app-layout'
import '@vaadin/app-layout/vaadin-drawer-toggle'
import '@vaadin/tabs'
import '@vaadin/tabs/vaadin-tab'
import '@vaadin/text-field'
import '@vaadin/integer-field'
import '@vaadin/number-field'
import "@vaadin/menu-bar"
import "@vaadin/checkbox"
import "@vaadin/text-area"
import "@vaadin/password-field"
import "@vaadin/date-picker"
import "@vaadin/date-time-picker"
import "@vaadin/time-picker"
import "@vaadin/rich-text-editor"
import "@vaadin/email-field"
import "@vaadin/upload"
import "@vaadin/list-box"
import "@vaadin/markdown"
import '@vaadin/item'
import '@polymer/paper-toggle-button'
import "@ui5/webcomponents/dist/ColorPicker.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import FormField from "@mateu/shared/apiClients/dtos/componentmetadata/FormField.ts";
import { ComboBoxDataProvider } from "@vaadin/combo-box";
import './mateu-grid'
import './mateu-choice'
import { ComboBoxLitRenderer, comboBoxRenderer } from "@vaadin/combo-box/lit";
import { ifDefined } from "lit/directives/if-defined.js";
import { dialogFooterRenderer, dialogRenderer } from "@vaadin/dialog/lit";
import { popoverRenderer } from "@vaadin/popover/lit";


@customElement('mateu-field')
export class MateuField extends LitElement {

    @property()
    field: FormField | undefined = undefined

    @property()
    baseUrl: string | undefined = undefined

    @property()
    state: any | undefined = undefined

    @property()
    data: any | undefined = undefined

    @state()
    colorPickerOpened = false

    @state()
    colorPickerValue : string | undefined = undefined


    renderColorPicker = () => {
        const fieldId = this.field?.fieldId!
        const value = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        return html`
            <ui5-color-picker value="${value}" @change="${(e: CustomEvent) => this.colorPickerValue = (e.target as HTMLInputElement).value}">Picker</ui5-color-picker>
        `
    }

    saveColor = () => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.colorPickerValue,
                //@ts-ignore
                fieldId: this.field!.fieldId
            },
            bubbles: true,
            composed: true
        }))
        this.colorPickerOpened = false
    }

    renderColorPickerFooter = () => {
        return html`<vaadin-button @click="${() => this.colorPickerOpened = false}">Cancel</vaadin-button>
        <vaadin-button theme="primary" @click="${this.saveColor}">Save</vaadin-button>`
    }

    checked = (e:Event) => {
        const input = e.target as HTMLInputElement;
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: input.checked,
                //@ts-ignore
                fieldId: this.field!.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    convert = (value: string): any => {
        if (this.field?.dataType == 'integer') {
            return parseInt(value)
        }
        return value
    }
    multiComboBoxValueChanged = (e: CustomEvent) => {
        const fieldId = this.field?.fieldId!
        const oldValue = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        let value = undefined
        if (e.detail.value) {
            value = e.detail.value.map((option: any) => option.value)
        }
        if (!this.compareArrays(value, oldValue)) this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: value,
                //@ts-ignore
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    valueChanged = (e: CustomEvent) => {
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value: this.convert(e.detail.value),
                //@ts-ignore
                fieldId: e.target.id
            },
            bubbles: true,
            composed: true
        }))
    }

    selectedItems = (value: any[]) => {
        if (value && value.length > 0) {
            return this.field?.options?.filter(option =>
                value.indexOf(option.value) >= 0)
        }
        return []
    }

    selectedIndex = (value: any) => {
        if (value) {
            const selectedOption = this.field?.options?.find(option => option.value == value)
            if (selectedOption) {
                return this.field?.options?.indexOf(selectedOption)
            }
        }
        return undefined
    }

    selectedIndexes = (value: any[]) => {
        if (value && value.length > 0) {
            return this.field?.options?.filter(option =>
                value.indexOf(option.value) >= 0)
                .map(option => this.field?.options?.indexOf(option))
        }
        return undefined
    }

    compareArrays = (a: any[], b: any[]) =>
        a.length === b.length &&
        a.every((element, index) => element === b[index]);

    listItemsSelected = (e: CustomEvent) => {
        const fieldId = this.field?.fieldId!
        const oldValue = this.state && fieldId in this.state?this.state[ fieldId]:this.field?.initialValue
        let value = undefined
        if (e.detail.value) {
            value = e.detail.value.map((index:any) => this.field!.options![index].value)
        }
        if (!this.compareArrays(value, oldValue)) this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value,
                //@ts-ignore
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    listItemSelected = (e: CustomEvent) => {
        let value = undefined
        if (e.detail.value || e.detail.value == 0) {
            const selectedOption = this.field!.options![e.detail.value]
            if (selectedOption) {
                value = selectedOption.value
            }
        }
        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value,
                //@ts-ignore
                fieldId: e.target.id
            },
            bubbles: true,
            composed: true
        }))
    }

    render() {
        const fieldId = this.field?.fieldId??''
        return html`<div>
            <div>${this.renderField()}</div>
            ${this.data.errors && this.data.errors[fieldId] && this.data.errors[fieldId].length > 0?html`
                <div><ul>${this.data.errors[fieldId].map((error: string) => html`<li>${error}</li>`)}</ul></div>
            `:nothing}
        </div>`
    }

    fileUploaded = (e:CustomEvent) => {
        const fieldId = this.field?.fieldId??''
        const value = this.state[fieldId] as any[]
        value.push({
            id: e.detail.xhr.responseText,
            name: e.detail.file.name
        })

        this.dispatchEvent(new CustomEvent('value-changed', {
            detail: {
                value,
                fieldId: this.field?.fieldId
            },
            bubbles: true,
            composed: true
        }))
    }

    fileChanged = (e:CustomEvent) => {
        const fieldId = this.field?.fieldId??''
        const newIds = ((e.detail.value as any[])??[]).filter((file: any) => file.id).map((file: any) => file.id)
        const oldIds = ((this.state[fieldId] as any[])??[]).map((file: any) => file.id)
        if (!this.compareArrays(oldIds, newIds)) {
            const newValues = ((e.detail.value as any[])??[]).filter((file: any) => file.id).map((file: any) => {
                return {
                    id: file.id,
                    name: file.name
                }
            })
            this.dispatchEvent(new CustomEvent('value-changed', {
                detail: {
                    value: newValues,
                    fieldId: this.field?.fieldId
                },
                bubbles: true,
                composed: true
            }))
        }
    }

    iconComboboxRenderer: ComboBoxLitRenderer<string> = (icon) => html`
  <div style="display: flex;">
      <vaadin-icon
              icon="${icon}"
              style="height: var(--lumo-size-m); margin-right: var(--lumo-space-s);"
      ></vaadin-icon>
    <div>
      ${icon}
      <div style="font-size: var(--lumo-font-size-s); color: var(--lumo-secondary-text-color);">
        ${icon}
      </div>
    </div>
  </div>
`;

    @state()
    private allIcons: string[] = [
        "vaadin:abacus",
        "vaadin:absolute-position",
        "vaadin:academy-cap",
        "vaadin:accessibility",
        "vaadin:accordion-menu",
        "vaadin:add-dock",
        "vaadin:adjust",
        "vaadin:adobe-flash",
        "vaadin:airplane",
        "vaadin:alarm",
        "vaadin:align-center",
        "vaadin:align-justify",
        "vaadin:align-left",
        "vaadin:align-right",
        "vaadin:alt-a",
        "vaadin:alt",
        "vaadin:ambulance",
        "vaadin:anchor",
        "vaadin:angle-double-down",
        "vaadin:angle-double-left",
        "vaadin:angle-double-right",
        "vaadin:angle-double-up",
        "vaadin:angle-down",
        "vaadin:angle-left",
        "vaadin:angle-right",
        "vaadin:angle-up",
        "vaadin:archive",
        "vaadin:archives",
        "vaadin:area-select",
        "vaadin:arrow-backward",
        "vaadin:arrow-circle-down-o",
        "vaadin:arrow-circle-down",
        "vaadin:arrow-circle-left-o",
        "vaadin:arrow-circle-left",
        "vaadin:arrow-circle-right-o",
        "vaadin:arrow-circle-right",
        "vaadin:arrow-circle-up-o",
        "vaadin:arrow-circle-up",
        "vaadin:arrow-down",
        "vaadin:arrow-forward",
        "vaadin:arrow-left",
        "vaadin:arrow-long-down",
        "vaadin:arrow-long-left",
        "vaadin:arrow-right",
        "vaadin:arrow-up",
        "vaadin:arrows-cross",
        "vaadin:arrows-long-h",
        "vaadin:arrows-long-right",
        "vaadin:arrows-long-up",
        "vaadin:arrows-long-v",
        "vaadin:arrows",
        "vaadin:asterisk",
        "vaadin:at",
        "vaadin:automation",
        "vaadin:backspace-a",
        "vaadin:backspace",
        "vaadin:backwards",
        "vaadin:ban",
        "vaadin:bar-chart-h",
        "vaadin:bar-chart-v",
        "vaadin:bar-chart",
        "vaadin:barcode",
        "vaadin:bed",
        "vaadin:bell-o",
        "vaadin:bell-slash-o",
        "vaadin:bell-slash",
        "vaadin:bell",
        "vaadin:boat",
        "vaadin:bold",
        "vaadin:bolt",
        "vaadin:bomb",
        "vaadin:book-dollar",
        "vaadin:book-percent",
        "vaadin:book",
        "vaadin:bookmark-o",
        "vaadin:bookmark",
        "vaadin:briefcase",
        "vaadin:browser",
        "vaadin:bug-o",
        "vaadin:bug",
        "vaadin:building-o",
        "vaadin:building",
        "vaadin:bullets",
        "vaadin:bullseye",
        "vaadin:bus",
        "vaadin:buss",
        "vaadin:button",
        "vaadin:calc-book",
        "vaadin:calc",
        "vaadin:calendar-briefcase",
        "vaadin:calendar-clock",
        "vaadin:calendar-envelope",
        "vaadin:calendar-o",
        "vaadin:calendar-user",
        "vaadin:calendar",
        "vaadin:camera",
        "vaadin:car",
        "vaadin:caret-down",
        "vaadin:caret-left",
        "vaadin:caret-right",
        "vaadin:caret-square-down-o",
        "vaadin:caret-square-left-o",
        "vaadin:caret-square-right-o",
        "vaadin:caret-square-up-o",
        "vaadin:caret-up",
        "vaadin:cart-o",
        "vaadin:cart",
        "vaadin:cash",
        "vaadin:chart-3d",
        "vaadin:chart-grid",
        "vaadin:chart-line",
        "vaadin:chart-timeline",
        "vaadin:chart",
        "vaadin:chat",
        "vaadin:check-circle-o",
        "vaadin:check-circle",
        "vaadin:check-square-o",
        "vaadin:check-square",
        "vaadin:check",
        "vaadin:chevron-circle-down-o",
        "vaadin:chevron-circle-down",
        "vaadin:chevron-circle-left-o",
        "vaadin:chevron-circle-left",
        "vaadin:chevron-circle-right-o",
        "vaadin:chevron-circle-right",
        "vaadin:chevron-circle-up-o",
        "vaadin:chevron-circle-up",
        "vaadin:chevron-down-small",
        "vaadin:chevron-down",
        "vaadin:chevron-left-small",
        "vaadin:chevron-left",
        "vaadin:chevron-right-small",
        "vaadin:chevron-right",
        "vaadin:chevron-up-small",
        "vaadin:chevron-up",
        "vaadin:child",
        "vaadin:circle-thin",
        "vaadin:circle",
        "vaadin:clipboard-check",
        "vaadin:clipboard-cross",
        "vaadin:clipboard-heart",
        "vaadin:clipboard-pulse",
        "vaadin:clipboard-text",
        "vaadin:clipboard-user",
        "vaadin:clipboard",
        "vaadin:clock",
        "vaadin:close-big",
        "vaadin:close-circle-o",
        "vaadin:close-circle",
        "vaadin:close-small",
        "vaadin:close",
        "vaadin:cloud-download-o",
        "vaadin:cloud-download",
        "vaadin:cloud-o",
        "vaadin:cloud-upload-o",
        "vaadin:cloud-upload",
        "vaadin:cloud",
        "vaadin:cluster",
        "vaadin:code",
        "vaadin:coffee",
        "vaadin:cog-o",
        "vaadin:cog",
        "vaadin:cogs",
        "vaadin:coin-piles",
        "vaadin:coins",
        "vaadin:combobox",
        "vaadin:comment-ellipsis-o",
        "vaadin:comment-ellipsis",
        "vaadin:comment-o",
        "vaadin:comment",
        "vaadin:comments-o",
        "vaadin:comments",
        "vaadin:compile",
        "vaadin:compress-square",
        "vaadin:compress",
        "vaadin:connect-o",
        "vaadin:connect",
        "vaadin:controller",
        "vaadin:copy-o",
        "vaadin:copy",
        "vaadin:copyright",
        "vaadin:corner-lower-left",
        "vaadin:corner-lower-right",
        "vaadin:corner-upper-left",
        "vaadin:corner-upper-right",
        "vaadin:credit-card",
        "vaadin:crop",
        "vaadin:cross-cutlery",
        "vaadin:crosshairs",
        "vaadin:css",
        "vaadin:ctrl-a",
        "vaadin:ctrl",
        "vaadin:cube",
        "vaadin:cubes",
        "vaadin:curly-brackets",
        "vaadin:cursor-o",
        "vaadin:cursor",
        "vaadin:cutlery",
        "vaadin:dashboard",
        "vaadin:database",
        "vaadin:date-input",
        "vaadin:deindent",
        "vaadin:del-a",
        "vaadin:del",
        "vaadin:dental-chair",
        "vaadin:desktop",
        "vaadin:diamond-o",
        "vaadin:diamond",
        "vaadin:diploma-scroll",
        "vaadin:diploma",
        "vaadin:disc",
        "vaadin:doctor-briefcase",
        "vaadin:doctor",
        "vaadin:dollar",
        "vaadin:dot-circle",
        "vaadin:download-alt",
        "vaadin:download",
        "vaadin:drop",
        "vaadin:edit",
        "vaadin:eject",
        "vaadin:elastic",
        "vaadin:ellipsis-circle-o",
        "vaadin:ellipsis-circle",
        "vaadin:ellipsis-dots-h",
        "vaadin:ellipsis-dots-v",
        "vaadin:ellipsis-h",
        "vaadin:ellipsis-v",
        "vaadin:enter-arrow",
        "vaadin:enter",
        "vaadin:envelope-o",
        "vaadin:envelope-open-o",
        "vaadin:envelope-open",
        "vaadin:envelope",
        "vaadin:envelopes-o",
        "vaadin:envelopes",
        "vaadin:eraser",
        "vaadin:esc-a",
        "vaadin:esc",
        "vaadin:euro",
        "vaadin:exchange",
        "vaadin:exclamation-circle-o",
        "vaadin:exclamation-circle",
        "vaadin:exclamation",
        "vaadin:exit-o",
        "vaadin:exit",
        "vaadin:expand-full",
        "vaadin:expand-square",
        "vaadin:expand",
        "vaadin:external-browser",
        "vaadin:external-link",
        "vaadin:eye-slash",
        "vaadin:eye",
        "vaadin:eyedropper",
        "vaadin:facebook-square",
        "vaadin:facebook",
        "vaadin:factory",
        "vaadin:family",
        "vaadin:fast-backward",
        "vaadin:fast-forward",
        "vaadin:female",
        "vaadin:file-add",
        "vaadin:file-code",
        "vaadin:file-font",
        "vaadin:file-movie",
        "vaadin:file-o",
        "vaadin:file-picture",
        "vaadin:file-presentation",
        "vaadin:file-process",
        "vaadin:file-refresh",
        "vaadin:file-remove",
        "vaadin:file-search",
        "vaadin:file-sound",
        "vaadin:file-start",
        "vaadin:file-table",
        "vaadin:file-text-o",
        "vaadin:file-text",
        "vaadin:file-tree-small",
        "vaadin:file-tree-sub",
        "vaadin:file-tree",
        "vaadin:file-zip",
        "vaadin:file",
        "vaadin:fill",
        "vaadin:film",
        "vaadin:filter",
        "vaadin:fire",
        "vaadin:flag-checkered",
        "vaadin:flag-o",
        "vaadin:flag",
        "vaadin:flash",
        "vaadin:flask",
        "vaadin:flight-landing",
        "vaadin:flight-takeoff",
        "vaadin:flip-h",
        "vaadin:flip-v",
        "vaadin:folder-add",
        "vaadin:folder-o",
        "vaadin:folder-open-o",
        "vaadin:folder-open",
        "vaadin:folder-remove",
        "vaadin:folder-search",
        "vaadin:folder",
        "vaadin:font",
        "vaadin:form",
        "vaadin:forward",
        "vaadin:frown-o",
        "vaadin:funcion",
        "vaadin:function",
        "vaadin:funnel",
        "vaadin:gamepad",
        "vaadin:gavel",
        "vaadin:gift",
        "vaadin:glass",
        "vaadin:glasses",
        "vaadin:globe-wire",
        "vaadin:globe",
        "vaadin:golf",
        "vaadin:google-plus-square",
        "vaadin:google-plus",
        "vaadin:grab",
        "vaadin:grid-bevel",
        "vaadin:grid-big-o",
        "vaadin:grid-big",
        "vaadin:grid-h",
        "vaadin:grid-small-o",
        "vaadin:grid-small",
        "vaadin:grid-v",
        "vaadin:grid",
        "vaadin:group",
        "vaadin:hammer",
        "vaadin:hand",
        "vaadin:handle-corner",
        "vaadin:hands-up",
        "vaadin:handshake",
        "vaadin:harddrive-o",
        "vaadin:harddrive",
        "vaadin:hash",
        "vaadin:header",
        "vaadin:headphones",
        "vaadin:headset",
        "vaadin:health-card",
        "vaadin:heart-o",
        "vaadin:heart",
        "vaadin:home-o",
        "vaadin:home",
        "vaadin:hospital",
        "vaadin:hourglass-empty",
        "vaadin:hourglass-end",
        "vaadin:hourglass-start",
        "vaadin:hourglass",
        "vaadin:inbox",
        "vaadin:indent",
        "vaadin:info-circle-o",
        "vaadin:info-circle",
        "vaadin:info",
        "vaadin:input",
        "vaadin:insert",
        "vaadin:institution",
        "vaadin:invoice",
        "vaadin:italic",
        "vaadin:key-o",
        "vaadin:key",
        "vaadin:keyboard-o",
        "vaadin:keyboard",
        "vaadin:laptop",
        "vaadin:layout",
        "vaadin:level-down-bold",
        "vaadin:level-down",
        "vaadin:level-left-bold",
        "vaadin:level-left",
        "vaadin:level-right-bold",
        "vaadin:level-right",
        "vaadin:level-up-bold",
        "vaadin:level-up",
        "vaadin:lifebuoy",
        "vaadin:lightbulb",
        "vaadin:line-bar-chart",
        "vaadin:line-chart",
        "vaadin:line-h",
        "vaadin:line-v",
        "vaadin:lines-list",
        "vaadin:lines",
        "vaadin:link",
        "vaadin:list-ol",
        "vaadin:list-select",
        "vaadin:list-ul",
        "vaadin:list",
        "vaadin:location-arrow-circle-o",
        "vaadin:location-arrow-circle",
        "vaadin:location-arrow",
        "vaadin:lock",
        "vaadin:magic",
        "vaadin:magnet",
        "vaadin:mailbox",
        "vaadin:male",
        "vaadin:map-marker",
        "vaadin:margin-bottom",
        "vaadin:margin-left",
        "vaadin:margin-right",
        "vaadin:margin-top",
        "vaadin:margin",
        "vaadin:medal",
        "vaadin:megafone",
        "vaadin:megaphone",
        "vaadin:meh-o",
        "vaadin:menu",
        "vaadin:microphone",
        "vaadin:minus-circle-o",
        "vaadin:minus-circle",
        "vaadin:minus-square-o",
        "vaadin:minus",
        "vaadin:mobile-browser",
        "vaadin:mobile-retro",
        "vaadin:mobile",
        "vaadin:modal-list",
        "vaadin:modal",
        "vaadin:money-deposit",
        "vaadin:money-exchange",
        "vaadin:money-withdraw",
        "vaadin:money",
        "vaadin:moon-o",
        "vaadin:moon",
        "vaadin:morning",
        "vaadin:movie",
        "vaadin:music",
        "vaadin:mute",
        "vaadin:native-button",
        "vaadin:newspaper",
        "vaadin:notebook",
        "vaadin:nurse",
        "vaadin:office",
        "vaadin:open-book",
        "vaadin:option-a",
        "vaadin:option",
        "vaadin:options",
        "vaadin:orientation",
        "vaadin:out",
        "vaadin:outbox",
        "vaadin:package",
        "vaadin:padding-bottom",
        "vaadin:padding-left",
        "vaadin:padding-right",
        "vaadin:padding-top",
        "vaadin:padding",
        "vaadin:paint-roll",
        "vaadin:paintbrush",
        "vaadin:palete",
        "vaadin:palette",
        "vaadin:panel",
        "vaadin:paperclip",
        "vaadin:paperplane-o",
        "vaadin:paperplane",
        "vaadin:paragraph",
        "vaadin:password",
        "vaadin:paste",
        "vaadin:pause",
        "vaadin:pencil",
        "vaadin:phone-landline",
        "vaadin:phone",
        "vaadin:picture",
        "vaadin:pie-bar-chart",
        "vaadin:pie-chart",
        "vaadin:piggy-bank-coin",
        "vaadin:piggy-bank",
        "vaadin:pill",
        "vaadin:pills",
        "vaadin:pin-post",
        "vaadin:pin",
        "vaadin:play-circle-o",
        "vaadin:play-circle",
        "vaadin:play",
        "vaadin:plug",
        "vaadin:plus-circle-o",
        "vaadin:plus-circle",
        "vaadin:plus-minus",
        "vaadin:plus-square-o",
        "vaadin:plus",
        "vaadin:pointer",
        "vaadin:power-off",
        "vaadin:presentation",
        "vaadin:print",
        "vaadin:progressbar",
        "vaadin:puzzle-piece",
        "vaadin:pyramid-chart",
        "vaadin:qrcode",
        "vaadin:question-circle-o",
        "vaadin:question-circle",
        "vaadin:question",
        "vaadin:quote-left",
        "vaadin:quote-right",
        "vaadin:random",
        "vaadin:raster-lower-left",
        "vaadin:raster",
        "vaadin:records",
        "vaadin:recycle",
        "vaadin:refresh",
        "vaadin:reply-all",
        "vaadin:reply",
        "vaadin:resize-h",
        "vaadin:resize-v",
        "vaadin:retweet",
        "vaadin:rhombus",
        "vaadin:road-branch",
        "vaadin:road-branches",
        "vaadin:road-split",
        "vaadin:road",
        "vaadin:rocket",
        "vaadin:rotate-left",
        "vaadin:rotate-right",
        "vaadin:rss-square",
        "vaadin:rss",
        "vaadin:safe-lock",
        "vaadin:safe",
        "vaadin:scale-unbalance",
        "vaadin:scale",
        "vaadin:scatter-chart",
        "vaadin:scissors",
        "vaadin:screwdriver",
        "vaadin:search-minus",
        "vaadin:search-plus",
        "vaadin:search",
        "vaadin:select",
        "vaadin:server",
        "vaadin:share-square",
        "vaadin:share",
        "vaadin:shield",
        "vaadin:shift-arrow",
        "vaadin:shift",
        "vaadin:shop",
        "vaadin:sign-in-alt",
        "vaadin:sign-in",
        "vaadin:sign-out-alt",
        "vaadin:sign-out",
        "vaadin:signal",
        "vaadin:sitemap",
        "vaadin:slider",
        "vaadin:sliders",
        "vaadin:smiley-o",
        "vaadin:sort",
        "vaadin:sound-disable",
        "vaadin:spark-line",
        "vaadin:specialist",
        "vaadin:spinner-arc",
        "vaadin:spinner-third",
        "vaadin:spinner",
        "vaadin:spline-area-chart",
        "vaadin:spline-chart",
        "vaadin:split-h",
        "vaadin:split-v",
        "vaadin:split",
        "vaadin:spoon",
        "vaadin:square-shadow",
        "vaadin:star-half-left-o",
        "vaadin:star-half-left",
        "vaadin:star-half-right-o",
        "vaadin:star-half-right",
        "vaadin:star-o",
        "vaadin:star",
        "vaadin:start-cog",
        "vaadin:step-backward",
        "vaadin:step-forward",
        "vaadin:stethoscope",
        "vaadin:stock",
        "vaadin:stop-cog",
        "vaadin:stop",
        "vaadin:stopwatch",
        "vaadin:storage",
        "vaadin:strikethrough",
        "vaadin:subscript",
        "vaadin:suitcase",
        "vaadin:sun-down",
        "vaadin:sun-o",
        "vaadin:sun-rise",
        "vaadin:superscript",
        "vaadin:sword",
        "vaadin:tab-a",
        "vaadin:tab",
        "vaadin:table",
        "vaadin:tablet",
        "vaadin:tabs",
        "vaadin:tag",
        "vaadin:tags",
        "vaadin:tasks",
        "vaadin:taxi",
        "vaadin:teeth",
        "vaadin:terminal",
        "vaadin:text-height",
        "vaadin:text-input",
        "vaadin:text-label",
        "vaadin:text-width",
        "vaadin:thin-square",
        "vaadin:thumbs-down-o",
        "vaadin:thumbs-down",
        "vaadin:thumbs-up-o",
        "vaadin:thumbs-up",
        "vaadin:ticket",
        "vaadin:time-backward",
        "vaadin:time-forward",
        "vaadin:timer",
        "vaadin:toolbox",
        "vaadin:tools",
        "vaadin:tooth",
        "vaadin:touch",
        "vaadin:train",
        "vaadin:trash",
        "vaadin:tree-table",
        "vaadin:trendind-down",
        "vaadin:trending-down",
        "vaadin:trending-up",
        "vaadin:trophy",
        "vaadin:truck",
        "vaadin:twin-col-select",
        "vaadin:twitter-square",
        "vaadin:twitter",
        "vaadin:umbrella",
        "vaadin:underline",
        "vaadin:unlink",
        "vaadin:unlock",
        "vaadin:upload-alt",
        "vaadin:upload",
        "vaadin:user-card",
        "vaadin:user-check",
        "vaadin:user-clock",
        "vaadin:user-heart",
        "vaadin:user-star",
        "vaadin:user",
        "vaadin:users",
        "vaadin:vaadin-h",
        "vaadin:vaadin-v",
        "vaadin:viewport",
        "vaadin:vimeo-square",
        "vaadin:vimeo",
        "vaadin:volume-down",
        "vaadin:volume-off",
        "vaadin:volume-up",
        "vaadin:volume",
        "vaadin:wallet",
        "vaadin:warning",
        "vaadin:workplace",
        "vaadin:wrench",
        "vaadin:youtube-square",
        "vaadin:youtube"
    ]

    @state()
    private filteredIcons: string[] = [];


    protected override async firstUpdated() {
        this.filteredIcons = this.allIcons;
    }

    iconFilterChanged = (event: CustomEvent) => {
        this.filteredIcons = this.allIcons.filter(icon => !event.detail.value || icon.indexOf(event.detail.value) >= 0)
    }

    renderField(): TemplateResult {
        const fieldId = this.field?.fieldId??''
        const value = this.state && fieldId in this.state?this.state[fieldId]:this.field?.initialValue
        if (this.field?.dataType == 'file') {
            console.log('value', value)
            const files = value.map((file: { id: string,
                name: string
            }) => {
                return {
                    id: file.id,
                    name: file.name,
                    type: '',
                    uploadTarget: '',
                    complete: true
                }
            })
            return html`
                <vaadin-upload
                        target="/upload"
                        .files="${files}"
                        @upload-success="${this.fileUploaded}"
                        @files-changed="${this.fileChanged}"
                ></vaadin-upload>
            `
        }
        const label = this.field?.label + '' + (this.field?.required?' (*)':'')
        if (this.field?.dataType == 'string') {
            if (this.field?.stereotype == 'select') {
                return html`
                    <vaadin-select
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-select>
                `
            }
            if (this.field?.stereotype == 'markdown') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required}"
                            .helperText="${this.field.description}"
                    ><vaadin-markdown
                            .content="${value}"
                    ></vaadin-markdown>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'listBox') {
                return html`
                    <vaadin-custom-field
                            label="${label}"
                    >
                    <vaadin-list-box
                            id="${this.field.fieldId}"
                            selected="${ifDefined(this.selectedIndex(value))}"
                            @selected-changed="${this.listItemSelected}"
                            ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'radio') {
                return html`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            theme="vertical"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
            if (this.field.stereotype == 'popover') {
                return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required}"
                    >
                        <vaadin-horizontal-layout theme="spacing">
                            <div>${value}</div>
                            <div id="${this.field.fieldId}_popover">
                                <vaadin-icon icon="vaadin:angle-down"></vaadin-icon>
                            </div>
                        </vaadin-horizontal-layout>
                    <vaadin-popover
                            for="${this.field.fieldId}_popover"
                            theme="arrow no-padding"
                            modal
                            accessible-name-ref="notifications-heading"
                            content-width="300px"
                            position="bottom"
                            ${popoverRenderer(() => html`
                                <mateu-event-interceptor .target="${this}">
                                <mateu-choice
                                        .field="${this.field}"
                                        .value="${value}"
                                ></mateu-choice>
                                </mateu-event-interceptor>
                            `, [])}
                    ></vaadin-popover>
                    </vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'choice') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            required="${this.field.required}"
                    >
                        <mateu-choice
                                .field="${this.field}"
                                .value="${value}"
                        ></mateu-choice>
                        
                    </vaadin-custom-field>
                    `
            }
            if (this.field?.stereotype == 'popover') {
                return html`
                    <vaadin-radio-group
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            theme="vertical"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
            if (this.field?.stereotype == 'richText') {
                return html`
                    <vaadin-custom-field
                            label="${label}"
                    >
                    <vaadin-rich-text-editor
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                    ></vaadin-rich-text-editor>
                    </vaadin-custom-field>`
            }
            if (this.field?.stereotype == 'textarea') {
                return html`
                    <vaadin-text-area
                            id="${this.field.fieldId}"
                            label="${label}"
                            .maxlength="${this.field.charLimit}"
                            .value="${value}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                            
                    ></vaadin-text-area>`
            }
            if (this.field?.stereotype == 'email') {
                return html`
                    <vaadin-email-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-email-field>
                `
            }
            if (this.field?.stereotype == 'link') {
                if (this.field.readOnly) {
                    return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    ><a href="${value}">${value}</a></vaadin-custom-field>`
                }
                return html`
                            <vaadin-text-field
                                    id="${this.field.fieldId}"
                                    label="${label}"
                                    required="${this.field.required}"
                                    @value-changed="${this.valueChanged}"
                                    value="${value}"
                                    ?autofocus="${this.field.wantsFocus}"
                            >
                                <vaadin-icon slot="suffix" 
                                             icon="vaadin:external-link"
                                             style="cursor: pointer;"
                                             @click="${() => window.open(value, '_blank')?.focus()}"
                                ></vaadin-icon>
                            </vaadin-text-field>
                `
            }
            if (this.field?.stereotype == 'icon') {
                if (this.field.readOnly) {
                    return html`<vaadin-icon
                                             icon="${value}"
                    ></vaadin-icon>`
                }
                return html`
                    <vaadin-combo-box
                                    id="${this.field.fieldId}"
                                    label="${label}"
                                    required="${this.field.required}"
                                    @value-changed="${this.valueChanged}"
                                    value="${value}"
                                    ?autofocus="${this.field.wantsFocus}"
                            item-label-path="displayName"
                            style="--vaadin-combo-box-overlay-width: 16em"
                                    .filteredItems="${this.filteredIcons}"
                            @filter-changed="${this.iconFilterChanged}"
                            ${comboBoxRenderer(this.iconComboboxRenderer, [])}
                    >
                        ${value?html`<vaadin-icon slot="prefix" icon="${value}"></vaadin-icon>`:nothing}
                    </vaadin-combo-box>
                `
            }
            if (this.field?.stereotype == 'password') {
                return html`
                    <vaadin-password-field
                            id="${this.field.fieldId}"
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            required="${this.field.required}"
                    ></vaadin-password-field>
                `
            }
            if (this.field?.stereotype == 'html') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    ><div style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;">${unsafeHTML(value)}</div></vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'image') {
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    ><img 
                            src="${value}"
                            style="line-height: 20px; margin-top: 5px; margin-bottom: 24px;"></vaadin-custom-field>
                `
            }
            if (this.field?.stereotype == 'color') {
                if (this.field.readOnly) {
                    return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    ><span style="background-color: ${value}; display: block; height: 20px; width: 40px; margin-top: 5px; margin-bottom: 24px; border: 1px solid var(--lumo-secondary-text-color)"></vaadin-custom-field>
                `
                }
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    >
                        <input type="color" @input="${(e: Event) => {
                            console.log(e, e.target, (e.target as HTMLInputElement).value)
                            this.dispatchEvent(new CustomEvent('value-changed', {
                                detail: {
                                    value: (e.target as HTMLInputElement).value,
                                    //@ts-ignore
                                    fieldId: this.field!.fieldId
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }}"/>
                        <!--
                        <vaadin-horizontal-layout theme="spacing" style="align-items: center;">
                            <span style="background-color: ${value}; display: inline-block; height: 20px; width: 40px; border: 1px solid var(--lumo-secondary-text-color);"></span>
                            <vaadin-button @click="${() => this.colorPickerOpened = true}">Change</vaadin-button>
                        </vaadin-horizontal-layout>
                        -->
                    </vaadin-custom-field>
                    <vaadin-dialog
  header-title="Choose color"
  .opened="${this.colorPickerOpened}"
  @closed="${() => {
                    this.colorPickerOpened = false;
                }}"
  ${dialogRenderer(this.renderColorPicker, [])}
  ${dialogFooterRenderer(this.renderColorPickerFooter, [])}
></vaadin-dialog>
                `
            }
            return html`
                <vaadin-text-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?disabled="${this.field.disabled}"
                ></vaadin-text-field>
`
        }
        if (this.field?.dataType == 'number') {
            return html`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-number-field>`
        }
        if (this.field?.dataType == 'integer') {
            if (this.field.stereotype == 'stars') {
                let renderValue = value;
                if (isNaN(renderValue)) {
                    renderValue = 0
                }
                const values = [1, 2, 3, 4, 5]
                return html`<vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    >${values.map(index => html`
                    <vaadin-icon 
                            icon="vaadin:star" 
                            style="cursor: pointer; color: var(${index <= renderValue?'--lumo-warning-color':'--lumo-shade-30pct'});"
                            @click="${() => this.dispatchEvent(new CustomEvent('value-changed', {
                                detail: {
                                    value: index,
                                    //@ts-ignore
                                    fieldId: this.field!.fieldId
                                },
                                bubbles: true,
                                composed: true
                            }))}"
                    
                    ></vaadin-icon>
                `)}</vaadin-custom-field>`
            }
            if (this.field.stereotype == 'slider') {
                let renderValue = value;
                if (isNaN(renderValue)) {
                    renderValue = 0
                }
                return html`
                    <vaadin-custom-field
                            id="${this.field.fieldId}"
                            label="${label}"
                    ><input type="range" @input="${(e: Event) => {
                        console.log(e, e.target, (e.target as HTMLInputElement).value)
                        this.dispatchEvent(new CustomEvent('value-changed', {
                            detail: {
                                value: (e.target as HTMLInputElement).value,
                                //@ts-ignore
                                fieldId: this.field!.fieldId
                            },
                            bubbles: true,
                            composed: true
                        }))
                    }}" min="0" max="10" value="${renderValue??0}"/></vaadin-custom-field>
                `
            }
            return html`
                <vaadin-integer-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
                        step-buttons-visible
                ></vaadin-integer-field>
            `
        }
        if (this.field?.dataType == 'bool') {
            return html `
                <vaadin-custom-field
                        label="${label}"
                        ?required="${this.field.required}"
                >
                    ${this.field.stereotype == 'toggle'?html`
                        <paper-toggle-button id="${this.field.fieldId}"
                                             ?disabled=${this.field.disabled}
                                             ?checked=${value}
                                             @change=${this.checked}>
                        </paper-toggle-button>
                    `:html`
                        <vaadin-checkbox
                                id="${this.field.fieldId}"
                                @change="${this.checked}"
                                value="${value}"
                                ?checked=${value}
                                ?autofocus="${this.field.wantsFocus}"
                        ></vaadin-checkbox>
                    `}
                </vaadin-custom-field>
            `
        }
        if (this.field?.dataType == 'date') {
            return html`<vaadin-date-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-date-picker>`
        }
        if (this.field?.dataType == 'dateTime') {
            return html`<vaadin-date-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-date-time-picker>`
        }
        if (this.field?.dataType == 'time') {
            return html`<vaadin-time-picker
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ></vaadin-time-picker>`
        }
        if (this.field?.dataType == 'array') {
            if (this.field?.stereotype == 'grid') {
                return html`
                    <mateu-grid
                            id="${this.field.fieldId}"
                        .field="${this.field}"
                        .state="${this.state}"
                        .data="${this.data}"
                    ></mateu-grid>
`
            }
            if (this.field?.stereotype == 'listBox') {
                return html`
                    <vaadin-list-box multiple 
                                     .selectedValues="${ifDefined(this.selectedIndexes(value))}"
                                     @selected-values-changed="${this.listItemsSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>                
                `
            }
            if (this.field?.stereotype == 'combobox') {
                return html`
                    <vaadin-multi-select-combo-box
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            .selectedItems="${this.selectedItems(value)}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required}"
                            @selected-items-changed="${this.multiComboBoxValueChanged}"
                    ></vaadin-multi-select-combo-box>
                    `
            }
            return html `
                <vaadin-checkbox-group
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        theme="vertical"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
                >
                    ${this.field.options?.map(option => html`
                        <vaadin-checkbox 
                                value="${option.value}" 
                                label="${option.label}"
                                ?checked="${value?.indexOf(option.value) >= 0}"
                        ></vaadin-checkbox>
                    `)}
                </vaadin-checkbox-group>
            `
        }
        if (this.field?.dataType == 'reference') {
            if (this.field?.stereotype == 'combobox') {
                if (this.field?.remoteCoordinates) {

                    const coords = this.field.remoteCoordinates;

                    const dataProvider: ComboBoxDataProvider<any> = (params, callback) => {
                        const { filter, page, pageSize } = params;
                        if (this.data[this.id] && ((this.data[this.id].searchSignature || filter) && this.data[this.id].searchSignature != filter)) {
                            this.data[this.id] = undefined
                        }
                        if (this.data[this.id]
                            && this.data[this.id].content
                            && (this.data[this.id].totalElements <= (page + 1) * pageSize
                                ||
                                this.data[this.id].content.length >= (page + 1) * pageSize)) {
                            callback(this.data[this.id].content
                                    .slice(page * pageSize, ((page + 1) * pageSize)),
                                this.data[this.id].totalElements)
                        } else {
                            this.dispatchEvent(new CustomEvent('action-requested', {
                                detail: {
                                    actionId: coords.action,
                                    parameters: {
                                        searchText: filter,
                                        fieldId: this.field?.fieldId,
                                        size: pageSize,
                                        page,
                                        sort: undefined
                                    },
                                    callback: () => {
                                        if (this.data[this.id] && this.data[this.id].content) {
                                            callback(this.data[this.id].content
                                                    .slice(page * pageSize, ((page + 1) * pageSize)),
                                                this.data[this.id].totalElements)
                                        }
                                    }
                                },
                                bubbles: true,
                                composed: true
                            }))
                        }
                    };

                    let selectedItem = value
                    if (this.data[this.id] && this.data[this.id].content) {
                        selectedItem = this.data[this.id].content.find((item:any) => item.value == value)
                    }

                    return html`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-id-path="value"
                            .dataProvider="${dataProvider}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required}"
                            .selectedItem="${selectedItem}"
                    ></vaadin-combo-box>
                    `
                }
                return html`
                    <vaadin-combo-box
                            id="${this.field.fieldId}"
                            label="${label}"
                            item-label-path="label"
                            item-value-path="value"
                            .items="${this.field.options}"
                            .helperText="${this.field.description}"
                            @value-changed="${this.valueChanged}"
                            .selectedItem="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            ?required="${this.field.required}"
                    ></vaadin-combo-box>
                    `
            }
            if (this.field?.stereotype == 'listBox') {
                return html`aaa
                    <vaadin-list-box ?selected="${this.selectedIndex(value)}"
                                     @value-changed="${this.listItemSelected}"
                                     ?autofocus="${this.field.wantsFocus}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-item>${option.label}</vaadin-item>
                        `)}
                    </vaadin-list-box>                
                `
            }
            if (this.field?.stereotype == 'radio') {
                return html`
                    <vaadin-radio-group 
                            label="${label}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            ?autofocus="${this.field.wantsFocus}"
                            theme="vertical"
                            ?required="${this.field.required}"
                    >
                        ${this.field.options?.map(option => html`
                            <vaadin-radio-button value="${option.value}" label="${option.label}"></vaadin-radio-button>
                        `)}
</vaadin-radio-group>
                    `
            }
        }
        if (this.field?.dataType == 'money') {
            if (this.field.readOnly) {
                const amount = value
                let formatted = amount
                if (amount && amount.locale && amount.currency) {
                    formatted = new Intl.NumberFormat(amount.locale, { style: "currency", currency: amount.currency }).format(
                        amount.value,
                    )
                }
                formatted = new Intl.NumberFormat("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,

                }).format(
                    amount,
                )
                return html`<vaadin-custom-field
                        id="${this.field.fieldId}"
                        label="${label}"
                ><div style="width: 186px; text-align: right;">${formatted}</div></vaadin-custom-field>`
            }
            return html`<vaadin-number-field
                        id="${this.field.fieldId}"
                        label="${label}"
                        @value-changed="${this.valueChanged}"
                        value="${value}"
                        ?autofocus="${this.field.wantsFocus}"
                        ?required="${this.field.required}"
            ><div slot="prefix"><vaadin-select
                            item-label-path="label"
                            item-value-path="value"
                            .items="${[
                                {
                                    label: 'Euro',
                                    value: 'EUR'
                                },
                                {
                                    label: 'US Dollar',
                                    value: 'USD'
                                }
                            ]}"
                            @value-changed="${this.valueChanged}"
                            .value="${value}"
                            style="max-width: 100px;"
                    ></vaadin-select></div></vaadin-number-field>`
        }
        return html `<p>Unknown field type ${this.field?.dataType} / ${this.field?.stereotype}</p>`
    }

    static styles = css`
        

        
  `
}

declare global {
    interface HTMLElementTagNameMap {
        'mateu-field': MateuField
    }
}


