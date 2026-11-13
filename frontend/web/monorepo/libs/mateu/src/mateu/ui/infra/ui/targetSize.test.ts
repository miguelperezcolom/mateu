// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { CSSResult } from 'lit'
import './mateu-kanban'
import './mateu-calendar'
import './mateu-form-editor'

/** WCAG 2.5.8 (axe target-size, GA Explorer pass F5): the small controls of these elements are 24px targets. */
const cssOf = (tag: string): string => {
    const ctor = customElements.get(tag) as unknown as { styles?: CSSResult | CSSResult[] }
    const styles = ctor?.styles
    return (Array.isArray(styles) ? styles : [styles]).filter(Boolean).map(s => (s as CSSResult).cssText).join('\n')
}

const ruleOf = (css: string, selector: string): string => {
    const at = css.indexOf(selector + ' {')
    return at < 0 ? '' : css.slice(at, css.indexOf('}', at))
}

describe('small controls are 24px targets', () => {
    it('the kanban card\'s Move, a clickable calendar chip, a form-editor row button', () => {
        expect(ruleOf(cssOf('mateu-kanban'), '.move')).toMatch(/min-height:\s*24px/)
        expect(ruleOf(cssOf('mateu-calendar'), '.chip.clickable')).toMatch(/min-height:\s*24px/)
        expect(ruleOf(cssOf('mateu-form-editor'), '.row-btn')).toMatch(/min-height:\s*24px/)
    })
})
