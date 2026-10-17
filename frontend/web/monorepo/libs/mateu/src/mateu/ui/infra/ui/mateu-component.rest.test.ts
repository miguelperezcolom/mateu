// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const fetchExternalJson = vi.fn()
vi.mock('@infra/http/externalOptions.ts', async (importOriginal) => ({
    ...(await importOriginal<Record<string, unknown>>()),
    fetchExternalJson: (...args: unknown[]) => fetchExternalJson(...args),
}))

import './mateu-component'
import type { MateuComponent } from './mateu-component'
import { setNotifier, ToastMessage } from '@application/Notifier.ts'
import { pendingActions } from './pendingActions'
import { ComponentType } from '@mateu/shared/apiClients/dtos/ComponentType'
import { RuleAction } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleAction'
import { RuleResult } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleResult'
import { RuleFieldAttribute } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleFieldAttribute'

/**
 * A @RestAction runs in the browser: the endpoint is fetched with the live state interpolated,
 * the answer merged into the form, a toast shown and the declared route followed. A proxied source
 * goes through the server's reserved `__restfetch__` instead (the secret stays there). The fetch is
 * the seam mocked here.
 */

const toasts: ToastMessage[] = []
const sent: CustomEvent[] = []
const recordSent = (e: Event) => sent.push(e as CustomEvent)
const navigations: string[] = []
const recordNav = (e: Event) => navigations.push((e as CustomEvent).detail.route)

const mount = async (actions: unknown[], state: Record<string, unknown> = {}) => {
    const el = document.createElement('mateu-component') as MateuComponent & Record<string, any>
    el.id = 'c1'
    el.component = { id: 'c1', type: ComponentType.ServerSide, serverSideType: 'x.Form', children: [], actions } as any
    el.state = state
    document.body.appendChild(el)
    await el.updateComplete
    return el
}

const run = (el: HTMLElement, actionId: string) =>
    (el as any).manageActionRequestedEvent(new CustomEvent('action-requested', { detail: { actionId } }))

const flush = () => new Promise(r => setTimeout(r, 0))

beforeEach(() => {
    toasts.length = 0
    sent.length = 0
    navigations.length = 0
    fetchExternalJson.mockReset()
    setNotifier({ show: (m) => toasts.push(m) })
    document.addEventListener('server-side-action-requested', recordSent)
    document.addEventListener('navigate-to-requested', recordNav)
})

afterEach(() => {
    document.removeEventListener('server-side-action-requested', recordSent)
    document.removeEventListener('navigate-to-requested', recordNav)
    document.body.innerHTML = ''
    pendingActions.reset()
    setNotifier({ show: () => {} })
    vi.restoreAllMocks()
})

describe('a direct @RestAction', () => {
    it('fetches with the live state, merges the answer, toasts and follows the route', async () => {
        fetchExternalJson.mockResolvedValue({ result: { id: 42, status: 'sent' } })
        const el = await mount([{ id: 'send', restAction: {
            source: { url: '/api/orders/${state.ref}', method: 'POST' },
            resultPath: 'result', successMessage: 'Order ${state.id} sent', successRoute: '/orders/${state.id}',
        } }], { ref: 'A1' })
        run(el, 'send')
        await flush()
        const [source, resolve] = fetchExternalJson.mock.calls[0]
        expect(resolve(source.url)).toBe('/api/orders/A1')
        expect(el.state).toMatchObject({ ref: 'A1', id: 42, status: 'sent' })
        expect(toasts).toEqual([expect.objectContaining({ text: 'Order 42 sent', variant: 'success' })])
        expect(navigations).toEqual(['/orders/42'])
        expect(sent).toHaveLength(0)
    })

    it('landing on the route already on screen re-runs the listing search instead', async () => {
        fetchExternalJson.mockResolvedValue({})
        window.history.pushState({}, '', '/people')
        const el = await mount([{ id: 'delete', restAction: { source: { url: '/x', method: 'DELETE' }, successRoute: '/people' } }])
        const host = document.createElement('div')
        const shadow = host.attachShadow({ mode: 'open' })
        // the listing is a descendant, found by tag through shadow roots
        const search = vi.fn()
        shadow.appendChild(Object.assign(document.createElement('mateu-table-crud'), { search }))
        el.renderRoot.appendChild(host)
        run(el, 'delete')
        await flush()
        expect(navigations).toEqual([])
        expect(search).toHaveBeenCalled()
        window.history.pushState({}, '', '/')
    })

    it('a failed call shows an error toast and changes nothing', async () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        fetchExternalJson.mockRejectedValue(new Error('500'))
        const el = await mount([{ id: 'send', restAction: { source: { url: '/x' }, resultPath: '', successRoute: '/done' } }], { a: 1 })
        run(el, 'send')
        await flush()
        expect(toasts[0].variant).toBe('error')
        expect(el.state).toEqual({ a: 1 })
        expect(navigations).toEqual([])
    })

    it('a bulk action calls the endpoint once per selected row, and asks for a selection first', async () => {
        fetchExternalJson.mockResolvedValue({})
        const el = await mount([{ id: 'archive', restAction: {
            source: { url: '/api/${state.id}/archive' }, forEachSelectedRow: true, successMessage: 'Archived',
        } }])
        run(el, 'archive')
        expect(toasts[0].variant).toBe('error')
        expect(fetchExternalJson).not.toHaveBeenCalled()

        toasts.length = 0
        el.state = { crud_selected_items: [{ id: 1 }, { id: 2 }] }
        run(el, 'archive')
        await flush()
        expect(fetchExternalJson.mock.calls.map(([s, resolve]) => resolve(s.url))).toEqual(['/api/1/archive', '/api/2/archive'])
        expect(toasts.map(t => t.text)).toEqual(['Archived'])
    })
})

describe('a proxied @RestAction', () => {
    it('goes through the server reserved action and merges what it answers', async () => {
        const el = await mount([
            { id: 'send', restAction: { source: { url: '/x', proxy: true }, resultPath: 'r', successMessage: 'Done' } },
            { id: '__restfetch__' },
        ])
        run(el, 'send')
        expect(fetchExternalJson).not.toHaveBeenCalled()
        expect(sent[0].detail).toMatchObject({ actionId: '__restfetch__', parameters: { _sourceKind: 'action', _sourceId: 'send' } })
        sent[0].detail.callback({ appData: { _restfetch: { r: { total: 3 } } } })
        expect(el.state.total).toBe(3)
        expect(toasts.map(t => t.text)).toEqual(['Done'])
    })

    it('an upstream failure is reported with its status and nothing is merged', async () => {
        const el = await mount([
            { id: '__restdata__', restAction: { source: { url: '/x', proxy: true }, resultPath: 'r', successMessage: 'Done' } },
            { id: '__restfetch__' },
        ])
        run(el, '__restdata__')
        expect(sent[0].detail.parameters._sourceKind).toBe('data')
        sent[0].detail.callback({ appData: { _restfetchError: { status: 401 } } })
        expect(toasts).toEqual([expect.objectContaining({ variant: 'error', text: 'Request failed (HTTP 401)' })])
        expect(el.state.total).toBeUndefined()
    })

    it('a bulk proxied action loops on the server in one round trip', async () => {
        const el = await mount([
            { id: 'archive', restAction: { source: { url: '/x', proxy: true }, forEachSelectedRow: true, successMessage: 'Archived' } },
            { id: '__restfetch__' },
        ], { crud_selected_items: [{ id: 1 }, { id: 2 }] })
        run(el, 'archive')
        expect(sent).toHaveLength(1)
        expect(sent[0].detail.parameters).toMatchObject({ _forEachSelectedRow: true, _sourceId: 'archive' })
        sent[0].detail.callback({ appData: {} })
        expect(toasts.map(t => t.text)).toEqual(['Archived'])
    })
})

describe('rules that touch the rendered DOM', () => {
    const rule = (over: Record<string, unknown>) => ({
        filter: 'true', fieldName: 'f', fieldAttribute: RuleFieldAttribute.none, value: undefined,
        expression: undefined, result: RuleResult.Continue, actionId: '', ...over,
    })

    it('set attributes, disable/enable, classes and styles on the element with the field id', async () => {
        const el = await mount([])
        const target = document.createElement('input')
        target.id = 'f'
        el.renderRoot.appendChild(target)
        ;(el as unknown as { component: unknown }).component = { ...el.component, rules: [
            rule({ action: RuleAction.SetAttributeValue, fieldAttribute: 'placeholder', expression: "'Type ' + state.kind" }),
            rule({ action: RuleAction.SetAttributeValue, fieldAttribute: 'disabled', value: true }),
            rule({ action: RuleAction.SetCssClass, value: 'warn' }),
            rule({ action: RuleAction.SetStyle, expression: 'color', value: 'red' }),
        ] }
        el.state = { kind: 'name' }
        el.applyRules()
        expect(target.getAttribute('placeholder')).toBe('Type name')
        expect(target.hasAttribute('disabled')).toBe(true)
        expect(target.className).toBe('warn')
        expect(target.style.getPropertyValue('color')).toBe('red')

        ;(el as unknown as { component: unknown }).component = { ...el.component, rules: [rule({ action: RuleAction.SetAttributeValue, fieldAttribute: 'disabled', value: false })] }
        el.applyRules()
        expect(target.hasAttribute('disabled')).toBe(false)
    })
})
