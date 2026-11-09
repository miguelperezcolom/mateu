// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'lit'
import { renderButton } from './buttonRenderer'

/**
 * A ButtonGroup placed in content reaches the wire as a Button with `children` (the toolbar
 * group's shape). The neutral renderer draws it as one trigger opening the group's buttons, each
 * dispatching its own action — it used to draw a lone button with the group's label and no action.
 */
const group = {
    type: 'ClientSide', id: 'more', children: [],
    metadata: {
        type: 'Button', label: 'More', children: [
            { type: 'Button', label: 'Export', actionId: 'export' },
            { type: 'Button', label: 'Archive', actionId: 'archive', parameters: { all: true } },
        ],
    },
} as any

afterEach(() => { document.body.innerHTML = '' })

describe('a ButtonGroup in content', () => {
    it('draws a trigger and one button per member', () => {
        const host = document.createElement('div')
        render(renderButton(group, {}, {}), host)
        expect(host.querySelector('details summary')!.textContent).toContain('More')
        const buttons = [...host.querySelectorAll('details button')]
        expect(buttons.map(b => b.textContent!.trim())).toEqual(['Export', 'Archive'])
        expect(buttons.map(b => b.getAttribute('data-action-id'))).toEqual(['export', 'archive'])
    })

    it("a member dispatches its own action and closes the panel", () => {
        const host = document.createElement('div')
        document.body.appendChild(host)
        render(renderButton(group, {}, {}), host)
        const details = host.querySelector('details')!
        details.setAttribute('open', '')
        const seen: unknown[] = []
        host.addEventListener('action-requested', (e) => seen.push((e as CustomEvent).detail))
        ;(host.querySelectorAll('details button')[1] as HTMLButtonElement).click()
        expect(seen).toEqual([{ actionId: 'archive', parameters: { all: true } }])
        expect(details.hasAttribute('open')).toBe(false)
    })
})
