import { describe, expect, it } from 'vitest'
import { imageUrlOf } from './imageUrl'

describe('imageUrlOf (an uploadable image set from a typed or pasted URL)', () => {
    it('takes an http(s) URL or a path on this site, trimmed', () => {
        expect(imageUrlOf(' https://images.nasa.gov/x~medium.jpg ')).toBe('https://images.nasa.gov/x~medium.jpg')
        expect(imageUrlOf('http://localhost:8080/a.png')).toBe('http://localhost:8080/a.png')
        expect(imageUrlOf('/images/portrait.png')).toBe('/images/portrait.png')
        expect(imageUrlOf('images/portrait.png')).toBe('images/portrait.png')
    })

    it('refuses a blank, a data: URI, a protocol-relative URL and any other scheme', () => {
        for (const bad of ['', '   ', 'data:image/png;base64,AAAA', '//evil.example/x.png', 'javascript:alert(1)', 'java\tscript:alert(1)', 'file:///etc/passwd', 42, null]) {
            expect(imageUrlOf(bad), String(bad)).toBeUndefined()
        }
    })
})
