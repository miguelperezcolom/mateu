// @vitest-environment jsdom
// The subject here IS the DOM (shadow roots, tab order), so this file opts into
// jsdom; the suite default stays `node` for the pure-logic tests.
import { describe, it, expect, beforeEach } from 'vitest'
import { isInside, tabbablesWithin } from './focusTrap'

describe('tabbablesWithin', () => {

    beforeEach(() => { document.body.innerHTML = '' })

    const mount = (html: string) => {
        const host = document.createElement('div')
        host.innerHTML = html
        document.body.appendChild(host)
        // jsdom reports no layout, so offsetParent/getClientRects are empty for everything;
        // give the visibility probe something to say yes to.
        host.querySelectorAll('*').forEach((el) => {
            (el as HTMLElement).getClientRects = () => [{}] as unknown as DOMRectList
        })
        return host
    }

    it('finds native controls in order', () => {
        const host = mount(`
            <a href="#one">one</a>
            <button>two</button>
            <input>
            <textarea></textarea>
            <select></select>`)
        expect(tabbablesWithin(host).map((el) => el.tagName.toLowerCase()))
            .toEqual(['a', 'button', 'input', 'textarea', 'select'])
    })

    it('skips what cannot be tabbed to', () => {
        const host = mount(`
            <button disabled>no</button>
            <button hidden>no</button>
            <button aria-hidden="true">no</button>
            <button tabindex="-1">no</button>
            <button>yes</button>`)
        expect(tabbablesWithin(host).map((el) => el.textContent)).toEqual(['yes'])
    })

    it('crosses an open shadow root — the case that matters, since every overlay has one', () => {
        const host = mount('<div id="wrapper"></div>')
        const wrapper = host.querySelector('#wrapper')!
        const shadow = wrapper.attachShadow({ mode: 'open' })
        shadow.innerHTML = '<button>inside shadow</button>'
        shadow.querySelectorAll('*').forEach((el) => {
            (el as HTMLElement).getClientRects = () => [{}] as unknown as DOMRectList
        })
        expect(tabbablesWithin(host).map((el) => el.textContent)).toEqual(['inside shadow'])
    })

    it('counts a slotted element once, not twice', () => {
        const host = mount('<div id="wrapper"><button>slotted</button></div>')
        const wrapper = host.querySelector('#wrapper')!
        const shadow = wrapper.attachShadow({ mode: 'open' })
        shadow.innerHTML = '<slot></slot>'
        expect(tabbablesWithin(host).filter((el) => el.textContent === 'slotted').length).toBe(1)
    })

    it('recognises design-system controls that match no native selector', () => {
        const host = mount('<vaadin-button>go</vaadin-button><ui5-button>go</ui5-button>')
        expect(tabbablesWithin(host).length).toBe(2)
    })
})

describe('isInside', () => {

    it('is true for a descendant', () => {
        const outer = document.createElement('div')
        const inner = document.createElement('button')
        outer.appendChild(inner)
        expect(isInside(inner, outer)).toBe(true)
    })

    it('is true across a shadow boundary, where contains() would say no', () => {
        const outer = document.createElement('div')
        const hostEl = document.createElement('div')
        outer.appendChild(hostEl)
        const shadow = hostEl.attachShadow({ mode: 'open' })
        const inner = document.createElement('button')
        shadow.appendChild(inner)
        expect(outer.contains(inner)).toBe(false)
        expect(isInside(inner, outer)).toBe(true)
    })

    it('is false for an unrelated element, and for nothing', () => {
        const outer = document.createElement('div')
        expect(isInside(document.createElement('button'), outer)).toBe(false)
        expect(isInside(null, outer)).toBe(false)
    })
})
