import {customElement, property, state, query} from "lit/decorators.js";
import {css, html, LitElement} from "lit";
import Component from "./interfaces/Component";
import ValueChangedEvent from "./interfaces/ValueChangedEvent";
import '@vaadin/vaadin-upload'
import Field from "../../../../../../../../../../../shared/apiClients/dtos/Field";
import File from "../../../../../../../../../../../shared/apiClients/dtos/File";
import {nanoid} from "nanoid";
import {UploadElement} from "@vaadin/vaadin-upload/src/vaadin-upload";
import {UploadFile} from "@vaadin/vaadin-upload";
import {CustomField} from "@vaadin/custom-field";


@customElement('field-file')
export class FieldFile extends LitElement implements Component {

    @query('vaadin-custom-field')
    customField : CustomField | undefined

    isInvalid(): boolean | undefined {
        this.customField?.validate()
        return this.customField?.invalid
    }


    @property()
    required: boolean = false;

    setRequired(required: boolean): void {
        this.required = required;
    }


    setField(field: Field): void {
        this.field = field;
        this.fileidprefix = field.attributes.find(a => a.key == 'fileidprefix')?.value as string;
        this.fileid = nanoid();
        this.maxfiles = field.attributes.find(a => a.key == 'maxfiles')?.value as number;
    }

    setLabel(label: string): void {
        this.label = label
    }

    setPlaceholder(placeholder: string): void {
        this.placeholder = placeholder
    }

    setPattern(): void {
    }

    setEnabled(enabled: boolean): void {
        this.enabled = enabled;
    }

    // @ts-ignore
    onValueChanged(event: ValueChangedEvent): void {
    }

    setValue(value: unknown): void {
        if (!value) {
            this.value = [];
            return
        }
        if (Array.isArray(value)) {
            this.value = value as File[];
        } else {
            this.value = [value as File];
        }
        // @ts-ignore
        this.files = this.value.map(f => {
            return {
                name: f.name,
                type: f.type,
                uploadTarget: f.targetUrl,
                complete: true
            } as UploadFile
        })
    }

    setBaseUrl(value: string): void {
        this.baseUrl = value
    }

    @property()
    baseUrl = '';


    @property()
    label = '';

    @property()
    placeholder = '';

    @property()
    name = '';

    @property()
    onChange = (e:CustomEvent) => {
        const input = e.target as UploadElement;
        if (e.type == 'files-changed' && e.detail.value && e.detail.path?.indexOf('abort') > 0) {
            this.checkAndSendNotifyChanged(input)
        }
        if (e.type == 'upload-success') {
            this.checkAndSendNotifyChanged(input)
        }
    }

    private checkAndSendNotifyChanged(input: UploadElement) {
        const newFileList = input.files.filter(uf => !uf.abort).map(uf => { return {
            targetUrl: uf.uploadTarget,
            id: this.getFileId(uf.uploadTarget),
            name: uf.name,
            type: uf.type
        } as File })
        if (!this.areEqual(this.value, newFileList)) {
            this.onValueChanged({
                fieldId: this.field!.id,
                value: newFileList
            })
        }
    }

    areEqual(old: File[], now: File[]): boolean {
        const oldstr = old?old.map(f => f.name).join(','):''
        const nowstr = now?now.map(f => f.name).join(','):''
        return oldstr == nowstr;
    }

    getFileId(uploadTarget: string) {
        if (!uploadTarget) {
            return undefined
        }
        const tokens = uploadTarget.split('/');
        return tokens[tokens.length - 1].replace('mateuremoteistheremoteflavourofmateu', '')
    }

    @property()
    value: File[] = [];

    @state()
    files: File[] = [];

    @property()
    enabled = true;

    @property()
    field: Field | undefined;

    @property()
    maxfiles: number | undefined;

    @property()
    fileidprefix: string | undefined;

    @property()
    fileid: string | undefined;

    render() {
        return html`
            <vaadin-custom-field
                    label="${this.label}"
                    ?required=${this.required}
                    placeholder="${this.placeholder}"
                    helper-text="${this.field?.description}"
            >
            <vaadin-upload
                label="${this.label}"
                .maxFiles="${this.maxfiles}"
                @files-changed=${this.onChange}
                @upload-success=${this.onChange}
                           name="${this.name}" 
                           id="${this.name}"
                data-testid="${this.name}"
                           .files=${this.files}
                   ?disabled=${!this.enabled}
                ?required=${this.required}
                placeholder="${this.placeholder}"
                    target="${this.baseUrl + '/files/' + this.fileidprefix + this.fileid}"></vaadin-upload>
            </vaadin-custom-field>
            `
    }

    static styles = css`
        
        :host {
            width: 100%;
        }
    
        vaadin-custom-field {
            width: 100%;
        }
        vaadin-upload {
            width: 100%;
        }
    `
}



declare global {
    interface HTMLElementTagNameMap {
        'field-file': FieldFile
    }
}

