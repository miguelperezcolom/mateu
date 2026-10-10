import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import { parse } from 'yaml'
import { parseSchema } from './componentSchema'
import { decorateForPreview, parsePage } from './pageModel'
import {
    ProjectImage, filterImages, imageName, imageOfValue, isImageFile, isImageProp, previewImageSrc, withPreviewImages,
} from './projectImages'

const IMAGES: ProjectImage[] = [
    { path: 'src/main/resources/static/img/hero.jpg', url: '/img/hero.jpg', thumb: '/__mateu-images/t/src/main/resources/static/img/hero.jpg' },
    { path: 'src/main/resources/static/images/logo.svg', url: '/images/logo.svg', thumb: 'vscode-webview://x/logo.svg', src: 'http://127.0.0.1:1234/__mateu-images/t/logo.svg' },
    { path: 'public/avatars/ada.png', url: '/avatars/ada.png', thumb: 'data:image/png;base64,AAAA' },
]

describe('which properties hold an image', () => {
    it('by name: image, src, avatar, logo, favicon, and *Image / *ImageUrl', () => {
        for (const p of ['image', 'src', 'avatar', 'logo', 'favicon', 'heroImage', 'backgroundImage', 'coverImageUrl', 'imageUrl']) {
            expect(isImageProp(p), p).toBe(true)
        }
        for (const p of ['icon', 'label', 'imageless', 'images', 'Image', 'title', 'url', 'iconOnLeft']) {
            expect(isImageProp(p), p).toBe(false)
        }
    })

    it('only a string prop: a Form avatar that is a component is a slot, not an image', () => {
        expect(isImageProp('avatar', { kind: 'complex' })).toBe(false)
        expect(isImageProp('avatar', { kind: 'string' })).toBe(true)
        expect(isImageProp('poster', { kind: 'string', format: 'image/png' })).toBe(true)
    })

    it('over the generated schema: exactly these component props get the picker', () => {
        const raw = JSON.parse(readFileSync(resolve(__dirname, '../../../../../../../backend/shared/uidl/uidl-schema.json'), 'utf-8'))
        const schema = parseSchema(raw)
        const found: string[] = []
        for (const spec of schema.components.values()) {
            for (const p of spec.props) if (isImageProp(p.name, p)) found.push(`${spec.name}.${p.name}`)
        }
        // AppShell logo/favicon, every image/src prop; Form.avatar (a Component) is not one
        expect(found.sort()).toEqual([
            'AppShell.favicon', 'AppShell.logo', 'Avatar.image', 'Button.image', 'HeroSection.image', 'Image.src', 'OfferCard.image',
        ])
    })

    it('recognises the image files the hosts list', () => {
        for (const f of ['a.png', 'b.JPG', 'c.jpeg', 'd.gif', 'e.svg', 'f.webp', 'g.avif']) expect(isImageFile(f), f).toBe(true)
        for (const f of ['a.txt', 'b.yaml', 'png', 'c.png.bak']) expect(isImageFile(f), f).toBe(false)
    })
})

describe('the picker model', () => {
    it('finds the image a value names, with or without the leading slash', () => {
        expect(imageOfValue(IMAGES, '/img/hero.jpg')?.path).toContain('hero.jpg')
        expect(imageOfValue(IMAGES, 'img/hero.jpg')?.path).toContain('hero.jpg')
        expect(imageOfValue(IMAGES, 'https://cdn.example.com/hero.jpg')).toBeUndefined()
        expect(imageOfValue(IMAGES, '')).toBeUndefined()
        expect(imageOfValue(IMAGES, 42)).toBeUndefined()
    })

    it('filters by every typed word, in the url or the path, sorted by url', () => {
        expect(filterImages(IMAGES, '').map(imageName)).toEqual(['ada.png', 'logo.svg', 'hero.jpg'])
        expect(filterImages(IMAGES, 'static svg').map(imageName)).toEqual(['logo.svg'])
        expect(filterImages(IMAGES, 'public').map(imageName)).toEqual(['ada.png'])
        expect(filterImages(IMAGES, 'nothing')).toEqual([])
    })
})

describe('the canvas shows project images from where the host serves them', () => {
    it('previewImageSrc prefers the canvas source over the thumbnail', () => {
        expect(previewImageSrc(IMAGES, '/img/hero.jpg')).toBe('/__mateu-images/t/src/main/resources/static/img/hero.jpg')
        expect(previewImageSrc(IMAGES, '/images/logo.svg')).toBe('http://127.0.0.1:1234/__mateu-images/t/logo.svg')
        expect(previewImageSrc(IMAGES, 'https://elsewhere/x.png')).toBeUndefined()
    })

    it('decorateForPreview swaps image props only, and leaves the file alone', () => {
        const doc = parsePage(`type: VerticalLayout
content:
  - {type: HeroSection, title: Hi, image: /img/hero.jpg}
  - {type: Image, src: img/hero.jpg}
  - {type: Image, src: https://cdn.example.com/x.png}
  - {type: Text, text: /img/hero.jpg}
`)
        const preview = parse(decorateForPreview(doc, IMAGES))
        expect(preview.content[0].image).toBe(IMAGES[0].thumb)
        expect(preview.content[1].src).toBe(IMAGES[0].thumb)
        expect(preview.content[2].src).toBe('https://cdn.example.com/x.png')
        expect(preview.content[3].text).toBe('/img/hero.jpg')
        expect(doc.layout.content![0].image).toBe('/img/hero.jpg')
        // no images: unchanged
        expect(parse(decorateForPreview(doc)).content[0].image).toBe('/img/hero.jpg')
    })

    it('withPreviewImages does the same deep inside any definition (Play), without mutating it', () => {
        const defs = { 'app.yaml': { type: 'AppShell', logo: '/images/logo.svg', menu: [{ label: 'x' }] } }
        const out = withPreviewImages(defs, IMAGES)
        expect(out['app.yaml'].logo).toBe(IMAGES[1].src)
        expect(defs['app.yaml'].logo).toBe('/images/logo.svg')
        expect(withPreviewImages(defs, [])).toBe(defs)
    })
})
