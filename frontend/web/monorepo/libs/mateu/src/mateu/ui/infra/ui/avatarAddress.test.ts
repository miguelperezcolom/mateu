// @vitest-environment jsdom
// An avatar is an image's address or the initials to write: a relative address once filled the circle as text.
import { describe, expect, it } from 'vitest'
import { isImageAddress } from './avatarAddress'
import './mateu-comment-thread'
import './mateu-org-chart'

describe('isImageAddress', () => {
    it.each(['https://x/a.png', 'http://x/a.png', 'data:image/png;base64,AA', '/photos/a'])('%s is an image', (avatar) => {
        expect(isImageAddress(avatar)).toBe(true)
    })
    it.each(['AG', 'Ana', '', null, undefined])('%s is not', (avatar) => {
        expect(isImageAddress(avatar)).toBe(false)
    })
})

type Mounted = HTMLElement & { shadowRoot: ShadowRoot, updateComplete: Promise<boolean> } & Record<string, unknown>

const mount = async (tag: string, props: Record<string, unknown>) => {
    const el = document.createElement(tag) as unknown as Mounted
    Object.assign(el, props)
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

describe('a relative address draws an image, and initials stay text', () => {
    it('in a comment thread', async () => {
        const el = await mount('mateu-comment-thread', { comments: [
            { id: '1', author: 'Ana', avatar: '/photos/a', text: 'x', timestamp: 'y' },
            { id: '2', author: 'Eva', avatar: 'EG', text: 'x', timestamp: 'y' },
        ] })
        const avatars = [...el.shadowRoot.querySelectorAll('.avatar')]
        expect(avatars[0].querySelector('img')?.getAttribute('src')).toBe('/photos/a')
        expect(avatars[0].textContent).not.toContain('/photos')
        expect(avatars[1].querySelector('img')).toBeNull()
        expect(avatars[1].textContent).toContain('EG')
    })

    it('in an org chart, in both presentations', async () => {
        const root = { id: 'a', title: 'Ana', avatar: '/photos/a', children: [{ id: 'b', title: 'Eva', avatar: 'EG' }] }
        for (const display of ['tree', 'focus']) {
            const el = await mount('mateu-org-chart', { root, display })
            const srcs = [...el.shadowRoot.querySelectorAll('img')].map(i => i.getAttribute('src'))
            expect(srcs, display).toContain('/photos/a')
            expect(el.shadowRoot.textContent, display).not.toContain('/photos')
            expect(el.shadowRoot.textContent, display).toContain('EG')
            el.remove()
        }
    })
})
