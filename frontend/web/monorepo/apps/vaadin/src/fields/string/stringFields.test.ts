// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, nothing } from 'lit'
import type { MateuField } from '../mateu-field'
import { renderStringField } from './index'
import { offersItsOptions } from './select'
import { renderLinkField } from './link'
import { renderIconField } from './icon'
import { renderColorField } from './color'
import { renderUploadableImageField } from './image'
import { renderComboboxField } from './combobox'
import { renderRadioField } from './radio'
import { renderReadOnlyField, renderBadgeField, copyValue } from '../readOnly'
import { renderNumberField, renderIntegerField } from '../number'
import { renderBoolField } from '../bool'
import { renderDateField, renderDateRangeField, renderDateTimeField, renderTimeField } from '../date'
import { renderArrayField } from '../array'
import { renderMoneyField, renderStatusField, renderRangeField } from '../money'
import { renderFileField } from '../file'
import { renderSearchableMultiField } from '../searchableMulti'

/**
 * The string-field render functions split out of mateu-field: pure functions of the field host
 * (the mateu-field element, here a stand-in carrying just what they read). Which control each
 * stereotype picks is pinned through the dispatcher, in the order the element used to test them.
 */
const host = (field: Record<string, unknown> | undefined, over: Record<string, unknown> = {}) => {
    const h: Record<string, unknown> = {
        field: field ? { fieldId: 'f', dataType: 'string', label: 'Field', ...field } : undefined,
        id: 'f', state: {}, data: {}, appState: {}, appData: {}, component: undefined,
        comboData: [], filteredIcons: [],
        selectedIndex: () => -1, selectedIndexes: () => [], selectedItems: () => [],
        helperText: () => '',
        dispatchEvent: vi.fn(() => true),
        requestRemoteOptions: vi.fn(), requestUpdate: vi.fn(),
        remoteComboDataProvider: vi.fn(() => () => {}),
        comboRenderer: () => '', iconComboboxRenderer: () => '',
        ...over,
    }
    return h as unknown as MateuField
}

const draw = (t: unknown) => {
    const div = document.createElement('div')
    render(t, div)
    return div
}
const tagOf = (div: HTMLElement) => div.querySelector('*')?.tagName.toLowerCase()

afterEach(() => { vi.restoreAllMocks() })

describe('string fields', () => {
    it.each([
        ['searchable', 'vaadin-custom-field'],
        ['select', 'vaadin-select'],
        ['markdown', 'vaadin-custom-field'],
        ['combobox', 'vaadin-combo-box'],
        ['listBox', 'vaadin-custom-field'],
        ['radio', 'vaadin-radio-group'],
        ['popover', 'vaadin-custom-field'],
        ['choice', 'vaadin-custom-field'],
        ['richText', 'vaadin-custom-field'],
        ['textarea', 'vaadin-text-area'],
        ['email', 'vaadin-email-field'],
        ['link', 'vaadin-text-field'],
        ['icon', 'vaadin-combo-box'],
        ['password', 'vaadin-password-field'],
        ['html', 'vaadin-custom-field'],
        ['image', 'vaadin-custom-field'],
        ['treeSelect', 'div'],
        ['signature', 'vaadin-custom-field'],
        ['camera', 'vaadin-custom-field'],
        ['fileUpload', 'vaadin-custom-field'],
        ['uploadableImage', 'vaadin-custom-field'],
        ['color', 'vaadin-custom-field'],
        ['regular', 'vaadin-text-field'],
        [undefined, 'vaadin-text-field'],
    ])('stereotype %s draws a %s', (stereotype, tag) => {
        expect(tagOf(draw(renderStringField(host({ stereotype }), 'f', 'v', 'Field', 'Field')))).toBe(tag)
    })

    it('each stereotype draws its own capture element', () => {
        const inner = (stereotype: string, sel: string) =>
            draw(renderStringField(host({ stereotype }), 'f', '', 'Field', 'Field')).querySelector(sel)
        expect(inner('signature', 'mateu-signature-pad')).not.toBeNull()
        expect(inner('camera', 'mateu-camera-capture')).not.toBeNull()
        expect(inner('fileUpload', 'mateu-file-upload')).not.toBeNull()
        expect(inner('treeSelect', 'mateu-vaadin-tree-select')).not.toBeNull()
        expect(inner('markdown', 'mateu-markup-editor')).not.toBeNull()
        expect(inner('html', 'mateu-markup-editor')).not.toBeNull()
    })

    it('a plain string that brings options is a select; a stereotyped one is not', () => {
        expect(offersItsOptions({ options: [{ value: 'a' }] })).toBe(true)
        expect(offersItsOptions({ stereotype: 'regular', options: [{ value: 'a' }] })).toBe(true)
        expect(offersItsOptions({ stereotype: 'radio', options: [{ value: 'a' }] })).toBe(false)
        expect(offersItsOptions({ options: [] })).toBe(false)
        expect(offersItsOptions(undefined)).toBe(false)
        const div = draw(renderStringField(host({ options: [{ value: 'r1', label: 'One' }] }), 'f', { value: 'r1' }, 'Field', 'Field'))
        expect(tagOf(div)).toBe('vaadin-select')
        expect((div.querySelector('vaadin-select') as unknown as { value: string }).value).toBe('r1')
    })

    it('a select with remote options asks the host for them', () => {
        const h = host({ stereotype: 'select', remoteCoordinates: { action: 'search-f' } })
        draw(renderStringField(h, 'f', 'v', 'Field', 'Field'))
        expect(h.requestRemoteOptions).toHaveBeenCalledWith('search-f')
    })

    it('link, icon and color draw their own read-only form', () => {
        expect(draw(renderLinkField(host({ stereotype: 'link', readOnly: true }), 'https://example.com', 'L')).querySelector('a')?.getAttribute('href'))
            .toBe('https://example.com')
        expect(tagOf(draw(renderIconField(host({ stereotype: 'icon', readOnly: true }), 'vaadin:plus', 'I')))).toBe('vaadin-icon')
        expect(draw(renderColorField(host({ stereotype: 'color', readOnly: true }), '#ff0000', 'C')).querySelector('span[role="img"]')).not.toBeNull()
    })

    it('editing a colour emits value-changed with the field id', () => {
        const h = host({ stereotype: 'color' })
        const input = draw(renderColorField(h, '#000000', 'C')).querySelector('input[type="color"]') as HTMLInputElement
        input.value = '#00ff00'
        input.dispatchEvent(new Event('input'))
        const event = (h.dispatchEvent as ReturnType<typeof vi.fn>).mock.calls[0][0] as CustomEvent
        expect(event.type).toBe('value-changed')
        expect(event.detail).toEqual({ value: '#00ff00', fieldId: 'f' })
    })

    it('an uploadable image offers Delete only when there is an image', () => {
        const withImage = draw(renderUploadableImageField(host({ stereotype: 'uploadableImage' }), 'data:image/png;base64,x', 'P'))
        expect(withImage.querySelector('img')).not.toBeNull()
        expect(withImage.querySelectorAll('vaadin-button').length).toBe(2)
        const empty = draw(renderUploadableImageField(host({ stereotype: 'uploadableImage' }), '', 'P'))
        expect(empty.querySelector('img')).toBeNull()
        expect(empty.querySelectorAll('vaadin-button').length).toBe(1)
    })

    it('a remote combobox shows the selected value from the data, else from its label', () => {
        const fromData = host({ stereotype: 'combobox', remoteCoordinates: { action: 'search-f' } },
            { data: { f: { content: [{ value: 'a', label: 'Alpha' }] } } })
        const combo = (d: HTMLElement) => d.querySelector('vaadin-combo-box') as unknown as { selectedItem?: { label: string } }
        expect(combo(draw(renderComboboxField(fromData, 'a', 'C'))).selectedItem?.label).toBe('Alpha')
        const fromLabel = host({ stereotype: 'combobox', remoteCoordinates: { action: 'search-f' } }, { data: { 'f-label': 'Beta' } })
        expect(combo(draw(renderComboboxField(fromLabel, 'b', 'C'))).selectedItem?.label).toBe('Beta')
    })

    it('a remote radio group lists the options the server answered', () => {
        const h = host({ stereotype: 'radio', remoteCoordinates: { action: 'search-f' } },
            { data: { f: { content: [{ value: 'a', label: 'A' }, { value: 'b', label: 'B' }] } } })
        expect(draw(renderRadioField(h, 'a', 'R')).querySelectorAll('vaadin-radio-button').length).toBe(2)
        expect(h.requestRemoteOptions).toHaveBeenCalledWith('search-f')
    })
})

describe('every field render function draws nothing without a field', () => {
    const none = host(undefined)
    it.each([
        ['string', () => renderStringField(none, 'f', 'v', nothing, '')],
        ['link', () => renderLinkField(none, 'v', nothing)],
        ['color', () => renderColorField(none, 'v', nothing)],
        ['readOnly', () => renderReadOnlyField(none, 'f', 'v', nothing, '')],
        ['badge', () => renderBadgeField(none, 'f', 'v', nothing, '')],
        ['number', () => renderNumberField(none, 'f', 1, nothing, '')],
        ['integer', () => renderIntegerField(none, 'f', 1, nothing, '')],
        ['bool', () => renderBoolField(none, 'f', true, nothing, '')],
        ['date', () => renderDateField(none, 'f', '', nothing, '')],
        ['dateRange', () => renderDateRangeField(none, 'f', '', nothing, '')],
        ['dateTime', () => renderDateTimeField(none, 'f', '', nothing, '')],
        ['time', () => renderTimeField(none, 'f', '', nothing, '')],
        ['array', () => renderArrayField(none, 'f', [], nothing, '')],
        ['money', () => renderMoneyField(none, 'f', 1, nothing, '')],
        ['status', () => renderStatusField(none, 'f', '', nothing, '')],
        ['range', () => renderRangeField(none, 'f', '', nothing, '')],
        ['file', () => renderFileField(none, 'f', [], nothing, '')],
        ['searchableMulti', () => renderSearchableMultiField(none, 'f', [], nothing)],
    ])('%s', (_name, fn) => {
        expect(draw(fn()).children.length).toBe(0)
    })

    it('copying a read-only value writes it to the clipboard', async () => {
        const writeText = vi.fn(() => Promise.resolve())
        Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
        copyValue('abc')
        expect(writeText).toHaveBeenCalledWith('abc')
    })
})

describe('the Vaadin field elements load on first use', () => {
    it('vaadin-markdown and vcf-date-range-picker are registered as lazy elements', async () => {
        await import('../lazyFieldElements')
        const { lazyElementTags } = await import('@infra/ui/lazyElements.ts')
        expect(lazyElementTags()).toEqual(expect.arrayContaining(['vaadin-markdown', 'vcf-date-range-picker']))
    })
})
