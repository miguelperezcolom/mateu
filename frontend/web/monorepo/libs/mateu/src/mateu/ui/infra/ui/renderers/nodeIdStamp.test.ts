// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest'
import { html, render } from 'lit'
import { buttonId, isNodeIdStamping, nodeIdAttr, setNodeIdStamping, stampButton, stampNodeId } from './nodeIdStamp'

const settle = async () => { for (let i = 0; i < 3; i++) await Promise.resolve() }

afterEach(() => setNodeIdStamping(false))

describe('editor node-id stamping', () => {
    it('is off by default: production markup carries no editor id', async () => {
        expect(isNodeIdStamping()).toBe(false)
        expect(buttonId({ id: 've-buttons.0', actionId: 'save' })).toBe('save')
        const host = document.createElement('div')
        render(stampButton({ id: 've-toolbar.0' }, html`<button>New</button>`), host)
        await settle()
        expect(host.querySelector('[data-node-id]')).toBeNull()
    })

    it('tags the FIRST element a renderer painted, whatever came before it', async () => {
        const host = document.createElement('div')
        render(html`<span>before</span>${stampNodeId('ve-0', html`text <div class="root"><b>x</b></div><div class="second"></div>`)}`, host)
        await settle()
        expect(host.querySelector('.root')!.getAttribute('data-node-id')).toBe('ve-0')
        expect(host.querySelector('span')!.hasAttribute('data-node-id')).toBe(false)
        expect(host.querySelector('.second')!.hasAttribute('data-node-id')).toBe(false)
    })

    it('lets the innermost component win when two share a root element', async () => {
        const host = document.createElement('div')
        render(stampNodeId('ve-0', html`${stampNodeId('ve-0-0', html`<div class="shared"></div>`)}`), host)
        await settle()
        expect(host.querySelector('.shared')!.getAttribute('data-node-id')).toBe('ve-0-0')
    })

    it('re-tags on a re-render that moves the element to another node', async () => {
        const host = document.createElement('div')
        const paint = (id: string) => render(html`${stampNodeId(id, html`<div class="n"></div>`)}`, host)
        paint('ve-0'); await settle()
        paint('ve-1'); await settle()
        expect(host.querySelector('.n')!.getAttribute('data-node-id')).toBe('ve-1')
    })

    it('in the editor: buttons and hand-painted children carry their authored ids', async () => {
        setNodeIdStamping(true)
        expect(buttonId({ id: 've-buttons.0', actionId: 'save' })).toBe('ve-buttons.0')
        expect(buttonId({ actionId: 'save' })).toBe('save')
        expect(nodeIdAttr({ id: 've-tabs.0' })).toBe('ve-tabs.0')
        const host = document.createElement('div')
        render(stampButton({ id: 've-toolbar.0' }, html`<button>New</button>`), host)
        await settle()
        expect(host.querySelector('button')!.getAttribute('data-node-id')).toBe('ve-toolbar.0')
    })
})
