// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-choice'
import type { MateuChoice } from './mateu-choice'

afterEach(() => { document.body.innerHTML = ''; vi.unstubAllGlobals() })

const options = [
    { value: 'a', label: 'Alpha' },
    { value: 'b', label: 'Beta', description: 'Second letter', image: '/b.png' },
]

async function mount(props: Partial<MateuChoice>) {
    const el = document.createElement('mateu-choice') as MateuChoice
    Object.assign(el, props)
    const changes: any[] = []
    const actions: any[] = []
    el.addEventListener('value-changed', e => changes.push((e as CustomEvent).detail))
    el.addEventListener('action-requested', e => actions.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, changes, actions, choices: () => [...el.shadowRoot!.querySelectorAll('.choice')] as HTMLElement[] }
}

describe('choice field', () => {
    it('renders each option as a keyboard-reachable button, marking the selected one', async () => {
        const { choices } = await mount({ field: { fieldId: 'f', options } as any, value: 'b' })
        const [a, b] = choices()
        expect(a.getAttribute('role')).toBe('button')
        expect(a.getAttribute('tabindex')).toBe('0')
        expect(a.textContent!.trim()).toBe('Alpha')
        expect(b.classList.contains('selected')).toBe(true)
        expect(a.classList.contains('selected')).toBe(false)
        // an option with description/image shows both
        expect(b.querySelector('img')!.getAttribute('src')).toBe('/b.png')
        expect(b.textContent).toContain('Second letter')
    })

    it('a single choice emits the clicked value, also on Enter/Space', async () => {
        const { choices, changes } = await mount({ field: { fieldId: 'f', options } as any })
        choices()[0].click()
        choices()[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
        expect(changes).toEqual([{ value: 'a', fieldId: 'f' }, { value: 'b', fieldId: 'f' }])
    })

    it('a multiple choice (array) adds and removes values', async () => {
        const field = { fieldId: 'f', dataType: 'array', options } as any
        const empty = await mount({ field })
        empty.choices()[0].click()
        expect(empty.changes.at(-1).value).toEqual(['a'])

        const some = await mount({ field, value: ['a'] })
        expect(some.choices()[0].classList.contains('selected')).toBe(true)
        some.choices()[1].click()
        expect(some.changes.at(-1).value).toEqual(['a', 'b'])
        some.choices()[0].click()
        expect(some.changes.at(-1).value).toEqual([])
    })

    it('asks the server for remote options until they arrive, then shows them', async () => {
        const field = { fieldId: 'f', remoteCoordinates: { action: 'search-f' } } as any
        const { actions, choices, el } = await mount({ field })
        expect(actions[0]).toEqual({ actionId: 'search-f', parameters: { searchText: '', fieldId: 'f', size: 200, page: 0, sort: undefined } })
        expect(choices()).toHaveLength(0)
        el.data = { f: { content: [{ value: 'r', label: 'Remote' }], totalElements: 1 } }
        await el.updateComplete
        expect(choices().map(c => c.textContent!.trim())).toEqual(['Remote'])
    })
})

describe('choice field fed by a REST source', () => {
    it('lists the source\'s options, and a multiple choice toggles their values', async () => {
        vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([{ id: 7, name: 'Apollo 11' }, { id: 25, name: 'Artemis III' }]), {
            status: 200, headers: { 'Content-Type': 'application/json' },
        })))
        const optionsSource = { url: 'https://api.example.test/missions', valuePath: 'id', labelPath: 'name' }
        const { el, changes, choices } = await mount({ field: { fieldId: 'f', dataType: 'array', optionsSource } as any, value: [25], data: {} as any })
        await vi.waitFor(async () => { await el.updateComplete; expect(choices().length).toBe(2) })
        expect(choices().map(c => c.textContent!.trim())).toEqual(['Apollo 11', 'Artemis III'])
        expect(choices()[1].classList.contains('selected')).toBe(true)
        choices()[0].click()
        expect(changes.at(-1).value).toEqual([25, 7])
    })
})
