import { describe, expect, it } from 'vitest'
import { actionPanelColumnsOf, shortcutMatches } from './mateu-action-panel'

const item = (label: string, extra: Record<string, unknown> = {}) => ({ label, actionId: 'iWantTo', parameters: { what: label }, ...extra })
const panel = {
    maxPerCategory: 3,
    categories: [
        { title: 'Modify', actions: [item('Check out'), item('Routing'), item('Traces', { count: 2, populated: true }), item('Packages'), item('Alerts', { count: 30, populated: true })] },
        { title: 'Create', actions: [item('Copy', { disabled: true })] },
        { title: 'Empty', actions: [] },
    ],
}

describe('actionPanelColumnsOf', () => {
    it('lists populated actions first, cuts at maxPerCategory and drops empty categories', () => {
        const columns = actionPanelColumnsOf(panel)
        expect(columns.map((c) => c.title)).toEqual(['Modify', 'Create'])
        expect(columns[0].actions.map((a) => a.label)).toEqual(['Traces (2)', 'Alerts (25+)', 'Check out'])
        expect(columns[0].hiddenCount).toBe(2)
        expect(columns[0].actions[0].parameters).toEqual({ what: 'Traces' })
        expect(columns[1].actions[0].disabled).toBe(true)
    })

    it('shows everything in a column once asked to', () => {
        const columns = actionPanelColumnsOf(panel, { showAll: new Set([0]) })
        expect(columns[0].actions).toHaveLength(5)
        expect(columns[0].hiddenCount).toBe(0)
    })

    it('hides unpopulated actions and the categories they leave empty', () => {
        const columns = actionPanelColumnsOf(panel, { hideUnpopulated: true })
        expect(columns.map((c) => c.title)).toEqual(['Modify'])
        expect(columns[0].actions.map((a) => a.label)).toEqual(['Traces (2)', 'Alerts (25+)'])
        expect(columns[0].hiddenCount).toBe(0)
    })

    it('defaults to 10 per category', () => {
        const many = { categories: [{ title: 'X', actions: Array.from({ length: 12 }, (_, i) => item('a' + i)) }] }
        expect(actionPanelColumnsOf(many)[0].hiddenCount).toBe(2)
    })
})

describe('shortcutMatches', () => {
    const ev = (o: Record<string, unknown>) => ({ key: '', code: '', ctrlKey: false, altKey: false, shiftKey: false, metaKey: false, ...o })
    it('matches by key or by code, with exact modifiers', () => {
        expect(shortcutMatches('ctrl+i', ev({ ctrlKey: true, key: 'i', code: 'KeyI' }))).toBe(true)
        expect(shortcutMatches('ctrl+i', ev({ ctrlKey: true, key: '¡', code: 'KeyI' }))).toBe(true)
        expect(shortcutMatches('ctrl+i', ev({ ctrlKey: true, shiftKey: true, key: 'I', code: 'KeyI' }))).toBe(false)
        expect(shortcutMatches('ctrl+i', ev({ key: 'i', code: 'KeyI' }))).toBe(false)
        expect(shortcutMatches(null, ev({ ctrlKey: true, key: 'i' }))).toBe(false)
    })
})
