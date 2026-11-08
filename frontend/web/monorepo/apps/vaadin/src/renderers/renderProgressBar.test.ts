// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import type ClientSideComponent from '@mateu/shared/apiClients/dtos/ClientSideComponent'
import { renderProgressBar } from './renderProgressBar'
import { renderProgressBar as renderNeutralProgressBar } from '@infra/ui/renderers/progressBarRenderer'

const bar = (metadata: Record<string, unknown>) =>
    ({ type: 'ClientSide', id: 'p', metadata: { type: 'ProgressBar', value: 0.5, ...metadata }, children: [] }) as unknown as ClientSideComponent

const host = (tpl: unknown) => {
    const el = document.createElement('div')
    render(tpl as any, el)
    return el
}

describe('ProgressBar theme', () => {
    it('reaches vaadin-progress-bar as its theme (success / error / contrast), danger meaning error', () => {
        const themeOf = (theme?: string) => host(renderProgressBar(bar({ theme }))).querySelector('vaadin-progress-bar')!.getAttribute('theme')
        expect(themeOf('success')).toBe('success')
        expect(themeOf('error')).toBe('error')
        expect(themeOf('danger')).toBe('error')
        expect(themeOf('contrast')).toBe('contrast')
        expect(themeOf(undefined)).toBeNull()
    })

    it('tints the neutral <progress> too', () => {
        const style = (theme?: string) => host(renderNeutralProgressBar(bar({ theme }))).querySelector('progress')!.getAttribute('style')
        expect(style('success')).toContain('accent-color: var(--lumo-success-color')
        expect(style('error')).toContain('accent-color: var(--lumo-error-color')
        expect(style(undefined)).not.toContain('accent-color')
    })
})
