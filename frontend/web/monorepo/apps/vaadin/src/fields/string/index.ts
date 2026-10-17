import { html, TemplateResult } from 'lit'
import type { FieldLabel, FieldValue } from '../fieldEvents'
import type { MateuField } from '../mateu-field'
import { renderCameraField, renderFileUploadField, renderSignatureField } from './capture'
import { renderChoiceField, renderPopoverField } from './choice'
import { renderColorField } from './color'
import { renderComboboxField } from './combobox'
import { renderIconField } from './icon'
import { renderImageField, renderUploadableImageField } from './image'
import { renderLinkField } from './link'
import { renderListBoxField } from './listBox'
import { renderHtmlField, renderMarkdownField } from './markup'
import { renderRadioField } from './radio'
import { renderSearchableField } from './searchable'
import { offersItsOptions, renderSelectField } from './select'
import { renderEmailField, renderPasswordField, renderRichTextField, renderTextField, renderTextareaField } from './text'
import { renderTreeSelectField } from './treeSelect'

/**
 * A string field: one render function per stereotype, tried in the order the field used to
 * test them (the select also catches a plain string that brings options). The fallback is a text field.
 */
export function renderStringField(host: MateuField, _fieldId: string, value: FieldValue, label: FieldLabel, _labelText: string): TemplateResult {
    if (!host.field) return html``
    if (host.field.stereotype == 'searchable') return renderSearchableField(host, value, label)
    if (host.field.stereotype == 'select' || offersItsOptions(host.field)) return renderSelectField(host, value, label)
    if (host.field.stereotype == 'markdown') return renderMarkdownField(host, value, label)
    if (host.field.stereotype == 'combobox') return renderComboboxField(host, value, label)
    if (host.field.stereotype == 'listBox') return renderListBoxField(host, value, label)
    if (host.field.stereotype == 'radio') return renderRadioField(host, value, label)
    if (host.field.stereotype == 'popover') return renderPopoverField(host, value, label)
    if (host.field.stereotype == 'choice') return renderChoiceField(host, value, label)
    if (host.field.stereotype == 'richText') return renderRichTextField(host, value, label)
    if (host.field.stereotype == 'textarea') return renderTextareaField(host, value, label)
    if (host.field.stereotype == 'email') return renderEmailField(host, value, label)
    if (host.field.stereotype == 'link') return renderLinkField(host, value, label)
    if (host.field.stereotype == 'icon') return renderIconField(host, value, label)
    if (host.field.stereotype == 'password') return renderPasswordField(host, value, label)
    if (host.field.stereotype == 'html') return renderHtmlField(host, value, label)
    if (host.field.stereotype == 'image') return renderImageField(host, value, label)
    if (host.field.stereotype == 'treeSelect') return renderTreeSelectField(host, value, label)
    if (host.field.stereotype == 'signature') return renderSignatureField(host, value, label)
    if (host.field.stereotype == 'camera') return renderCameraField(host, value, label)
    if (host.field.stereotype == 'fileUpload') return renderFileUploadField(host, value, label)
    if (host.field.stereotype == 'uploadableImage') return renderUploadableImageField(host, value, label)
    if (host.field.stereotype == 'color') return renderColorField(host, value, label)
    return renderTextField(host, value, label)
}
