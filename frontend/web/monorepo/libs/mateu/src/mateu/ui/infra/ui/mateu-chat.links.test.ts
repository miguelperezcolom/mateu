// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import './mateu-chat'
import type { MateuChat } from './mateu-chat'
import { chatNavigationOf, chatRouteOfClick, inAppRouteOf } from './chatLinks'

Element.prototype.scrollTo = () => {}

const sse = (payload: unknown) => `data:${typeof payload === 'string' ? payload : JSON.stringify(payload)}\n\n`
const settle = async () => { for (let i = 0; i < 20; i++) await new Promise(r => setTimeout(r, 0)) }

/** The data plane's menu, as the shell hands it to the chat once the remote sections answered. */
const MENU = [
    {
        label: 'Call center', submenus: [{
            label: 'Bookings', route: '/booking/bookings', consumedRoute: '', baseUrl: '/_booking',
            serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.BookingHome', uriPrefix: '', submenus: [],
            listing: {
                idField: 'id', idsParam: 'ids', searchParam: 'searchText',
                filters: [{ param: 'status', label: 'Status', type: 'enum', multiple: true, values: ['Pending', 'Confirmed', 'Cancelled'] }],
            },
        }],
    },
    {
        label: 'Admin', submenus: [{
            label: 'Processes', route: '/workflow/processes', consumedRoute: '', baseUrl: '/_workflow',
            serverSideType: 'io.mateu.workflow.infra.in.ui.WorkflowHome', uriPrefix: '', submenus: [],
        }],
    },
]

function chat(): MateuChat {
    const el = document.createElement('mateu-chat') as MateuChat
    el.sseUrl = '/ai/api/agent/stream'
    ;(el as unknown as { menu: unknown[] }).menu = MENU
    document.body.appendChild(el)
    return el
}

afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
})

describe('links to the app in an answer', () => {
    // The answer that came out with its links empty: «Nora Duarte: [EMPTY]». The agent now links a
    // record with plain markdown to its route; the panel must show the link — text AND target.
    const ANSWER = 'Para abrir su ficha:\n\n- Nora Duarte: [4MBZS7](/booking/bookings/4MBZS7)\n- Giulia Okafor: [JXD3G6](/booking/bookings/JXD3G6)'

    it('streams them, renders them non-empty, and a click opens the record in the app, chat kept', async () => {
        let body: Record<string, unknown> | undefined
        vi.stubGlobal('fetch', vi.fn((url: string, init?: RequestInit) => {
            if (url !== '/ai/api/agent/stream') return Promise.reject(new Error('no local agent'))
            body = JSON.parse(String(init?.body))
            const chunks = ['Para abrir su ficha:\n\n- Nora Duarte: [4MB', 'ZS7](/booking/book', 'ings/4MBZS7)\n- Giulia Okafor: [JXD3G6](/booking/bookings/JXD3G6)']
            const text = chunks.map(c => sse({ event: 'agent-delta', detail: { text: c } })).join('')
                + ANSWER.split('\n').map(line => `data:${line}`).join('\n') + '\n\n'
            return Promise.resolve(new Response(text, { status: 200 }))
        }))
        const el = chat()
        const navigations: Record<string, unknown>[] = []
        el.addEventListener('navigation-requested', e => navigations.push((e as CustomEvent).detail))

        await el.send(new CustomEvent('submit', { detail: { value: 'dame enlaces a sus fichas' } }))
        await settle()
        await el.updateComplete
        await settle()

        const links = [...el.shadowRoot!.querySelectorAll('.message-text a')] as HTMLAnchorElement[]
        expect(links.map(a => [a.textContent, a.getAttribute('href')])).toEqual([
            ['4MBZS7', '/booking/bookings/4MBZS7'],
            ['JXD3G6', '/booking/bookings/JXD3G6'],
        ])

        const click = new MouseEvent('click', { bubbles: true, composed: true, cancelable: true, button: 0 })
        links[0].dispatchEvent(click)
        expect(click.defaultPrevented).toBe(true)
        expect(navigations).toEqual([{
            route: '/booking/bookings/4MBZS7', consumedRoute: '', actionId: '', baseUrl: '/_booking',
            serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.BookingHome', uriPrefix: '',
        }])

        // the menu the agent learns the screens from carries each listing's URL filters and ids
        const context = body?.menuContext as { path: string[], listing?: { idsParam: string } }[]
        expect(context.find(entry => entry.path.join('>') === 'Call center>Bookings')?.listing?.idsParam).toBe('ids')
        expect(context.find(entry => entry.path.join('>') === 'Admin>Processes')?.listing).toBeUndefined()
    })
})

describe('chatLinks', () => {
    it('only a single-slash route is in-app', () => {
        expect(inAppRouteOf('/booking/bookings?ids=A,B')).toBe('/booking/bookings?ids=A,B')
        expect(inAppRouteOf('//evil.example/x')).toBeUndefined()
        expect(inAppRouteOf('https://ec1.mateu.io/x')).toBeUndefined()
        expect(inAppRouteOf('')).toBeUndefined()
    })

    it('a modified, middle or targeted click is left to the browser', () => {
        const a = (href: string, target?: string) => ({ getAttribute: (n: string) => n === 'href' ? href : n === 'target' ? (target ?? null) : null })
        expect(chatRouteOfClick(a('/x'), { button: 0 })).toBe('/x')
        expect(chatRouteOfClick(a('/x'), { button: 1 })).toBeUndefined()
        expect(chatRouteOfClick(a('/x'), { button: 0, metaKey: true })).toBeUndefined()
        expect(chatRouteOfClick(a('/x', '_blank'), { button: 0 })).toBeUndefined()
    })

    it('a route opens through the menu entry that serves it, query kept', () => {
        expect(chatNavigationOf(MENU, '/booking/bookings?status=Cancelled')).toEqual({
            route: '/booking/bookings?status=Cancelled', consumedRoute: '', actionId: '', baseUrl: '/_booking',
            serverSideType: 'io.mateu.ecdemo1.booking.infra.in.ui.BookingHome', uriPrefix: '',
        })
        expect(chatNavigationOf(MENU, '/workflow/processes/p-1')?.baseUrl).toBe('/_workflow')
        // a prefix of the SEGMENT is not a match: /booking/bookingsX is not under /booking/bookings
        expect(chatNavigationOf(MENU, '/booking/bookingsX')).toBeUndefined()
        expect(chatNavigationOf(MENU, '/nowhere')).toBeUndefined()
    })
})
