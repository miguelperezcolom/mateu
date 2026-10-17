// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-notice'
import { isIconName, type MateuNotice } from './mateu-notice'

afterEach(() => { document.body.innerHTML = '' })

async function mount(props: Partial<MateuNotice>) {
    const el = document.createElement('mateu-notice') as MateuNotice
    Object.assign(el, props)
    const actions: any[] = []
    el.addEventListener('action-requested', e => actions.push((e as CustomEvent).detail))
    document.body.appendChild(el)
    await el.updateComplete
    return { el, actions, root: el.shadowRoot! }
}

describe('notice', () => {
    it('a blank text hides it, unless it carries content', async () => {
        expect((await mount({ text: '  ' })).root.querySelector('.notice')).toBeNull()
        const withContent = await mount({ text: '', hasContent: true })
        expect(withContent.root.querySelector('.notice')).toBeTruthy()
        expect(withContent.root.querySelector('.content slot')).toBeTruthy()
        expect(withContent.root.querySelector('.text')).toBeNull()
    })

    it('tints by theme, falling back to info for an unknown one, and shows the text', async () => {
        const { root } = await mount({ text: '2 complaints', theme: 'warning', slim: true })
        const n = root.querySelector('.notice')!
        expect(n.className).toContain('warning')
        expect(n.className).toContain('slim')
        expect(root.querySelector('.text')!.textContent).toBe('2 complaints')
        expect(root.querySelector('.icon')).toBeTruthy()
        expect((await mount({ text: 'x', theme: 'purple' })).root.querySelector('.notice')!.className).toContain('info')
    })

    it('an emoji icon is drawn as content, an icon name through the icon set, and noIcon drops it', async () => {
        expect(isIconName('vaadin:user')).toBe(true)
        expect(isIconName('👥')).toBe(false)
        const emoji = await mount({ text: 'x', icon: '👥' })
        expect(emoji.root.querySelector('.icon.custom')!.textContent).toBe('👥')
        const named = await mount({ text: 'x', icon: 'vaadin:user' })
        expect(named.root.querySelector('.icon.custom')).toBeNull()
        expect(named.root.querySelector('.icon')).toBeTruthy()
        expect((await mount({ text: 'x', noIcon: true })).root.querySelector('.icon')).toBeNull()
    })

    it('its action dispatches the standard action-requested; without one it can show a status', async () => {
        const { root, actions } = await mount({ text: 'x', actionLabel: 'Review', actionId: 'review' })
        const button = root.querySelector('.notice-action') as HTMLButtonElement
        expect(button.textContent).toBe('Review')
        button.click()
        expect(actions).toEqual([{ actionId: 'review' }])
        const status = await mount({ text: 'x', status: 'Done', actionLabel: 'Only label' })
        expect(status.root.querySelector('.notice-action')).toBeNull()
        expect(status.root.querySelector('.status')!.textContent).toBe('Done')
    })

    it('inline content sits on the text line', async () => {
        const { root } = await mount({ text: 'x', hasContent: true, inlineContent: true })
        expect(root.querySelector('.body')!.classList.contains('inline')).toBe(true)
    })
})
