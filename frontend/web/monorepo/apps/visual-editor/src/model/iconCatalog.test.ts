import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { createRequire } from 'module'
import { resolve } from 'path'
import {
    REDWOOD_ICON_CSS, REDWOOD_ICON_TRANSLATIONS, filterIcons, iconSetOf, isIconProp, parseOjIconClasses, parseVaadinIconset,
    redwoodChoices, redwoodClassOf, redwoodIconRules,
} from './iconCatalog'

const require = createRequire(import.meta.url)

describe('icon properties get the icon picker', () => {
    it('recognises the icon-name props of the catalog — and only string ones', () => {
        for (const p of ['icon', 'iconOnLeft', 'iconOnRight', 'actionIcon', 'actionIcon2']) expect(isIconProp(p)).toBe(true)
        for (const p of ['favicon', 'noIcon', 'label', 'image', 'iconSize']) expect(isIconProp(p)).toBe(false)
        // `icon` typed as an enum (IconKey) keeps its own select
        expect(isIconProp('icon', { kind: 'enum' })).toBe(false)
    })

    it('the icon set follows the project\'s renderer', () => {
        expect(iconSetOf('redwood')).toBe('redwood')
        expect(iconSetOf('vaadin')).toBe('vaadin')
        expect(iconSetOf('neutral')).toBe('vaadin')
    })
})

describe('the Vaadin icon set', () => {
    it('is read from @vaadin/icons itself — every icon the renderer registers, each with its SVG', () => {
        const text = readFileSync(require.resolve('@vaadin/icons/vaadin-iconset.js'), 'utf-8')
        const icons = parseVaadinIconset(text)
        expect(icons.length).toBeGreaterThan(600)
        const cart = icons.find((i) => i.value === 'vaadin:cart')
        expect(cart?.svg).toMatch(/^<path /)
        expect(new Set(icons.map((i) => i.value)).size).toBe(icons.length)
    })
})

describe('the Redwood icon set', () => {
    it('mirrors the names the Redwood renderer translates (apps/redwood/poc/core/shellNav.mjs OJ_ICONS)', async () => {
        const path = resolve(__dirname, '../../../redwood/poc/core/shellNav.mjs')
        const mod: { OJ_ICONS: Record<string, string> } = await import(/* @vite-ignore */ path)
        expect(REDWOOD_ICON_TRANSLATIONS).toEqual(mod.OJ_ICONS)
    })

    it('lists the translated (portable) names first, then the icon font\'s classes', () => {
        const css = ".oj-ux-ico-cart:before{content:'\\f185'}.oj-ux-ico-bed:before{content:'\\f101'}.oj-ux-ico-cart:before{content:'x'}"
        expect(parseOjIconClasses(css)).toEqual(['oj-ux-ico-bed', 'oj-ux-ico-cart'])
        const choices = redwoodChoices(parseOjIconClasses(css), [{ value: 'vaadin:cart', svg: '<path d="M0"/>' }])
        expect(choices[0].value).toBe('vaadin:calendar-user')
        expect(choices.find((c) => c.value === 'vaadin:cart')).toEqual({ value: 'vaadin:cart', ojClass: 'oj-ux-ico-cart', hint: 'oj-ux-ico-cart', svg: '<path d="M0"/>' })
        expect(choices.slice(-2).map((c) => c.value)).toEqual(['oj-ux-ico-bed', 'oj-ux-ico-cart'])
    })

    it('paints a value as Redwood does: translated, a class as it is, anything else the generic icon', () => {
        expect(redwoodClassOf('vaadin:cart')).toBe('oj-ux-ico-cart')
        expect(redwoodClassOf('oj-ux-ico-bed')).toBe('oj-ux-ico-bed')
        expect(redwoodClassOf('vaadin:abacus')).toBe('oj-ux-ico-arrow-circle-right')
        expect(redwoodClassOf('')).toBeUndefined()
    })

    it('the icon-font stylesheet is used without touching the editor: absolute font URLs, no html rules', () => {
        const css = "/*! c */@font-face{font-family:ojuxIconFont;src:url('ojuxIconFont_Rg.woff2') format('woff2')}html{font-family:'Oracle Sans'}html[lang=ar]{font-family:x}[class*=oj-ux-ico-]{font-family:ojuxIconFont}.oj-ux-ico-cart:before{content:'\\f185'}"
        const { fontFaces, classes } = redwoodIconRules(css)
        expect(fontFaces).toContain(`url('${new URL('ojuxIconFont_Rg.woff2', REDWOOD_ICON_CSS).href}')`)
        expect(classes).not.toMatch(/html/)
        expect(classes).not.toMatch(/@font-face/)
        expect(classes).toContain('.oj-ux-ico-cart:before')
        expect(classes).toContain('[class*=oj-ux-ico-]')
    })
})

describe('searching the icons', () => {
    const choices = [{ value: 'vaadin:cart' }, { value: 'vaadin:shopping-cart' }, { value: 'oj-ux-ico-cart', hint: 'Redwood icon font' }, { value: 'vaadin:user' }]

    it('names starting with the text first (the prefix ignored), then those containing it', () => {
        expect(filterIcons(choices, 'cart').map((c) => c.value)).toEqual(['vaadin:cart', 'oj-ux-ico-cart', 'vaadin:shopping-cart'])
        expect(filterIcons(choices, '').length).toBe(4)
        expect(filterIcons(choices, 'redwood').map((c) => c.value)).toEqual(['oj-ux-ico-cart'])
    })
})
