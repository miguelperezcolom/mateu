// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import './mateu-markdown'

const rendered = async (content: string): Promise<HTMLElement> => {
    const el = document.createElement('mateu-markdown') as HTMLElement & { content?: string }
    document.body.appendChild(el)
    el.content = content
    for (let i = 0; i < 50 && !el.innerHTML; i++) await new Promise(r => setTimeout(r, 10))
    return el
}

describe('mateu-markdown sanitises with the data policy (B1)', () => {
    it('renders markdown and drops a <mateu-ux> aimed at another origin', async () => {
        const el = await rendered('# Hi\n\n<mateu-ux baseurl="https://attacker.example" route="x"></mateu-ux>'
            + '<form action="https://phish.example"><input type="password"></form>')
        expect(el.querySelector('h1')?.textContent).toBe('Hi')
        expect(el.innerHTML).not.toMatch(/mateu-ux|attacker|<form|<input/i)
    })

    it('keeps an allow-listed vaadin-icon', async () => {
        const el = await rendered('<vaadin-icon icon="vaadin:check"></vaadin-icon> ok')
        expect(el.querySelector('vaadin-icon')?.getAttribute('icon')).toBe('vaadin:check')
    })
})
