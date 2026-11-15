// @vitest-environment jsdom
// rc.1 re-verification of GA review 2 N-6 / C1 (chat markdown fetches nothing remote), with
// vectors of our own beside the ones the fix's test already covers.
import { describe, expect, it } from 'vitest'
import './mateu-markdown'

const chat = async (content: string): Promise<HTMLElement> => {
    const el = document.createElement('mateu-markdown') as HTMLElement & { content?: string }
    el.setAttribute('no-remote-images', '')
    document.body.appendChild(el)
    el.content = content
    for (let i = 0; i < 50 && !el.innerHTML; i++) await new Promise(r => setTimeout(r, 10))
    return el
}

describe('rc.1 re-verify N-6/C1: no-remote-images', () => {
    const vectors: Record<string, string> = {
        'style background-image url()': '<div style="background-image: URL( \'https://evil.example/a\' )">a</div>',
        'style --var url()': '<div style="--x:url(https://evil.example/b)">b</div>',
        'picture/source srcset': '<picture><source srcset="https://evil.example/c.webp" type="image/webp"><img alt="c"></picture>',
        'video poster (uppercase tag)': '<VIDEO POSTER="https://evil.example/d"></VIDEO>',
        'audio src autoplay': '<audio src="https://evil.example/e.mp3" autoplay></audio>',
        'track src': '<video><track src="https://evil.example/f.vtt"></video>',
        'svg image xlink:href': '<svg><image xlink:href="https://evil.example/g.png"></image></svg>',
        'svg filter feImage': '<svg><filter id="x"><feImage href="https://evil.example/h.png"/></filter></svg>',
        'table background': '<table background="https://evil.example/i.png"><tr><td>i</td></tr></table>',
        'td background': '<table><tr><td background="https://evil.example/j.png">j</td></tr></table>',
        'img srcset only': '<img srcset="https://evil.example/k.png 1x" alt="k">',
        'markdown image': '![l](https://evil.example/l.png)',
        'object data': '<object data="https://evil.example/m.svg"></object>',
        'embed src': '<embed src="https://evil.example/n.svg">',
        'iframe src': '<iframe src="https://evil.example/o"></iframe>',
        'link stylesheet': '<link rel="stylesheet" href="https://evil.example/p.css">',
    }
    for (const [name, md] of Object.entries(vectors)) {
        it(name, async () => {
            const el = await chat('x\n\n' + md)
            expect(el.innerHTML).not.toMatch(/evil\.example/)
        })
    }
})
