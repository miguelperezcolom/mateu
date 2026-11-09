// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import './mateu-faq'
import type { MateuFaq } from './mateu-faq'

afterEach(() => { document.body.innerHTML = '' })

describe('mateu-faq', () => {
    it('an answer is markdown: drawn by mateu-markdown, not as plain text', async () => {
        const faq = document.createElement('mateu-faq') as MateuFaq
        faq.items = [{ question: 'Pets?', answer: 'Yes — **dogs** up to 10 kg', open: true }]
        document.body.appendChild(faq)
        await faq.updateComplete
        const answer = faq.shadowRoot!.querySelector('.a')!
        const markdown = answer.querySelector('mateu-markdown') as HTMLElement & { content?: string }
        expect(markdown).not.toBeNull()
        expect(markdown.content).toBe('Yes — **dogs** up to 10 kg')
    })
})
