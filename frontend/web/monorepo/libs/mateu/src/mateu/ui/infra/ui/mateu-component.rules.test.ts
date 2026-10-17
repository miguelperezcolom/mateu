// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MateuComponent } from './mateu-component'
import { RuleAction } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleAction'
import { RuleResult } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleResult'
import { RuleFieldAttribute } from '@mateu/shared/apiClients/dtos/componentmetadata/RuleFieldAttribute'
import { configureRunJs, resetRunJs } from './runJs'

/**
 * mateu-component's client-side behaviour that runs WITHOUT the server: rules (evaluated by the
 * sandboxed expression evaluator — no eval), validations, action hrefs/js and the confirmation
 * modal. Driven on a real (unattached) element with its component, state and data set directly.
 */
const rule = (over: Record<string, unknown>) => ({
    filter: 'true', action: RuleAction.SetStateValue, fieldName: 'x', fieldAttribute: RuleFieldAttribute.none,
    value: undefined, expression: undefined, result: RuleResult.Continue, actionId: '', ...over,
})

const element = (component: Record<string, unknown>, state: Record<string, unknown> = {}, data: Record<string, unknown> = {}) => {
    const el = new MateuComponent() as any
    el.component = { id: 'c', type: 'ServerSide', serverSideType: 'x.Form', children: [], ...component }
    el.state = state
    el.data = data
    el.appState = {}
    el.appData = {}
    return el
}

afterEach(() => {
    resetRunJs()
    vi.restoreAllMocks()
    document.body.innerHTML = ''
})

describe('rules', () => {
    it('SetStateValue: a filter decides, an expression computes the value (with ${} substitution)', () => {
        const el = element({ rules: [
            rule({ filter: "state.country == 'ES'", fieldName: 'currency', value: 'EUR' }),
            rule({ filter: 'state.qty > 0', fieldName: 'total', expression: 'state.qty * ${state.price}' }),
            rule({ filter: "state.country == 'US'", fieldName: 'never', value: 'x' }),
        ] }, { country: 'ES', qty: 3, price: 2 })
        el.applyRules()
        expect(el.state).toMatchObject({ currency: 'EUR', total: 6 })
        expect(el.state.never).toBeUndefined()
    })

    it('SetDataValue writes field attributes as <field>.<attribute>', () => {
        const el = element({ rules: [
            rule({ action: RuleAction.SetDataValue, filter: '!state.vip', fieldName: 'discount,notes',
                fieldAttribute: RuleFieldAttribute.hidden, value: true }),
        ] }, { vip: false })
        el.applyRules()
        expect(el.data['discount.hidden']).toBe(true)
        expect(el.data['notes.hidden']).toBe(true)
    })

    it('a Stop result ends the rule chain', () => {
        const el = element({ rules: [
            rule({ fieldName: 'a', value: 1, result: RuleResult.Stop }),
            rule({ fieldName: 'b', value: 2 }),
        ] })
        el.applyRules()
        expect(el.state).toEqual({ a: 1 })
    })

    it('a broken rule is reported and the next ones still run', () => {
        const error = vi.spyOn(console, 'error').mockImplementation(() => {})
        const el = element({ rules: [
            rule({ filter: 'state.(', fieldName: 'a', value: 1 }),
            rule({ fieldName: 'b', value: 2 }),
        ] })
        el.applyRules()
        expect(error).toHaveBeenCalled()
        expect(el.state).toEqual({ b: 2 })
    })

    it('a rule expression cannot reach the Function constructor', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const el = element({ rules: [
            rule({ fieldName: 'a', expression: "''.constructor.constructor('return document')()" }),
        ] })
        el.applyRules()
        expect(el.state.a).toBeUndefined()
    })

    it('RunAction rules dispatch the action', () => {
        const el = element({ rules: [rule({ action: RuleAction.RunAction, actionId: 'recalculate' })] })
        const seen: string[] = []
        el.manageActionRequestedEvent = (e: CustomEvent) => seen.push(e.detail.actionId)
        el.applyRules()
        expect(seen).toEqual(['recalculate'])
    })

    it('RunJS is off unless enabled', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const state: Record<string, unknown> = {}
        const el = element({ rules: [rule({ action: RuleAction.RunJS, value: 'state.ran = true' })] }, state)
        el.applyRules()
        expect(state.ran).toBeUndefined()
        configureRunJs(true)
        el.applyRules()
        expect(state.ran).toBe(true)
    })
})

describe('validations', () => {
    it('collects the messages of failing conditions per field and flags the form invalid', () => {
        const el = element({ validations: [
            { fieldId: 'name', condition: "state['name']", message: 'Name is required' },
            { fieldId: 'age', condition: "state['age'] >= 18", message: 'Must be ${state.min}+' },
        ] }, { name: '', age: 12, min: 18 })
        el.checkValidations()
        expect(el.data.errors.name).toEqual(['Name is required'])
        expect(el.data.errors.age).toEqual(['Must be 18+'])
        expect(el.data._valid).toBe(false)
    })

    it('a passing form is valid with empty error lists', () => {
        const el = element({ validations: [{ fieldId: 'name', condition: "state['name']", message: 'x' }] }, { name: 'Ana' })
        el.checkValidations()
        expect(el.data.errors.name).toEqual([])
        expect(el.data._valid).toBe(true)
    })

    it('validates only the fields asked for', () => {
        const el = element({ validations: [
            { fieldId: 'a', condition: 'state.a', message: 'a!' },
            { fieldId: 'b', condition: 'state.b', message: 'b!' },
        ] }, {})
        el.checkValidations('a')
        expect(el.data.errors).toEqual({ a: ['a!'] })
    })

    it('after a refused submit, fixing a field clears its error as the user types', () => {
        // Left until blur, the message vanished in the middle of the click on the submit button:
        // the button jumped up under the pointer and the click was lost.
        const el = element({ validations: [
            { fieldId: 'name', condition: "state['name']", message: 'Name is required' },
            { fieldId: 'email', condition: "state['email']", message: 'Email is required' },
        ] }, { name: '', email: '' })
        el.checkValidations()
        expect(el.data._valid).toBe(false)
        el.valueChangedListener(new CustomEvent('value-changed', { detail: { fieldId: 'name', value: 'Ana' } }))
        expect(el.data.errors.name).toEqual([])
        expect(el.data.errors.email).toEqual(['Email is required'])
        el.valueChangedListener(new CustomEvent('value-changed', { detail: { fieldId: 'email', value: 'a@b.c' } }))
        expect(el.data._valid).toBe(true)
    })

    it('re-validating with the same outcome keeps the data object (no needless re-render)', () => {
        const el = element({ validations: [{ fieldId: 'name', condition: "state['name']", message: 'Name is required' }] }, { name: '' })
        el.checkValidations()
        const first = el.data
        el.checkValidations()
        expect(el.data).toBe(first)
    })

    it('a changed message replaces the data even when the form stays invalid', () => {
        const el = element({ validations: [{ fieldId: 'age', condition: 'state.age >= 18', message: 'Must be ${state.min}+' }] }, { age: 1, min: 18 })
        el.checkValidations()
        el.state = { age: 1, min: 21 }
        el.checkValidations()
        expect(el.data.errors.age).toEqual(['Must be 21+'])
    })

    it('errors of fields no longer validated are dropped', () => {
        const el = element({ validations: [
            { fieldId: 'a', condition: 'state.a', message: 'a!' },
            { fieldId: 'b', condition: 'state.b', message: 'b!' },
        ] }, {})
        el.checkValidations()
        el.checkValidations('a')
        expect(el.data.errors).toEqual({ a: ['a!'] })
    })

    it('before any submit, typing does not start flagging errors', () => {
        const el = element({ validations: [{ fieldId: 'name', condition: "state['name']", message: 'x' }] }, { name: 'A' })
        el.valueChangedListener(new CustomEvent('value-changed', { detail: { fieldId: 'name', value: '' } }))
        expect(el.data.errors).toBeUndefined()
    })
})

describe('actions that run on the client', () => {
    const detail = { actionId: 'go', parameters: {}, callback: undefined, callbackonly: false, initiatorComponentId: 'c', callbackToken: '' }

    it("an action's href is followed only when it is safe", () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        const open = vi.spyOn(window, 'open').mockImplementation(() => null)
        const el = element({})
        el.requestActionCallToServer(detail, el.component, { id: 'go', href: 'javascript:alert(1)' } as never)
        expect(warn).toHaveBeenCalled()
        el.requestActionCallToServer(detail, el.component, { id: 'go', href: 'https://elsewhere.example/doc' } as never)
        expect(open).toHaveBeenCalledWith('https://elsewhere.example/doc', '_blank', 'noopener,noreferrer')
    })

    it("an action's js only runs with RunJS enabled", () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {})
        const el = element({}, { count: 1 })
        const action = { id: 'go', js: 'state.count = state.count + 1' } as never
        el.requestActionCallToServer(detail, el.component, action)
        expect(el.state.count).toBe(1)
        configureRunJs(true)
        el.requestActionCallToServer(detail, el.component, action)
        expect(el.state.count).toBe(2)
    })
})

describe('the confirmation modal', () => {
    it('runs the callback on confirm, closes on Escape, and dies with its component', () => {
        const el = element({})
        document.body.appendChild(el)
        const callback = vi.fn()
        el.callAfterConfirmation({ id: 'delete', confirmationTexts: { message: 'Delete it?' } } as never, callback)
        const modal = () => Array.from(document.body.children).find((c) => (c as HTMLElement).textContent?.includes('Delete it?'))
        const buttons = modal()!.querySelectorAll('button')
        ;(buttons[1] as HTMLButtonElement).click()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(modal()).toBeUndefined()

        el.callAfterConfirmation({ id: 'delete', confirmationTexts: { message: 'Delete it?' } } as never, callback)
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
        expect(modal()).toBeUndefined()

        el.callAfterConfirmation({ id: 'delete', confirmationTexts: { message: 'Delete it?' } } as never, callback)
        expect(modal()).toBeDefined()
        el.remove()
        expect(modal()).toBeUndefined()
        expect(callback).toHaveBeenCalledTimes(1)
    })
})

/**
 * Rules are computed in willUpdate(), before the render: a keystroke on a form with rules renders
 * ONCE. They used to run in updated(), after the render, and assign `state` — which scheduled a
 * second render of the whole form for every change. The results must be the same either way.
 */
describe('rules run before the render', () => {
    const settle = async (el: any) => { while (!(await el.updateComplete)) { /* until no update is pending */ } }

    const mounted = async (rules: Record<string, unknown>[], state: Record<string, unknown>) => {
        const el = element({ rules }, state) as any
        document.body.appendChild(el)
        await settle(el)
        let renders = 0
        const render = el.render.bind(el)
        el.render = () => { renders++; return render() }
        return { el, renders: () => renders }
    }

    it('a change that fires value rules renders once, with the rules applied', async () => {
        const { el, renders } = await mounted([
            rule({ filter: 'state.qty > 0', fieldName: 'total', expression: 'state.qty * ${state.price}' }),
            rule({ filter: 'state.total > 10', fieldName: 'big', value: true }),
        ], { qty: 1, price: 2 })
        expect(el.state).toMatchObject({ total: 2 })
        expect(el.state.big).toBeUndefined()

        el.state = { ...el.state, qty: 6 }
        await settle(el)

        expect(renders()).toBe(1)
        // a rule that depends on another rule's output still sees it (they iterate to a fixed point)
        expect(el.state).toMatchObject({ qty: 6, total: 12, big: true })
    })

    it('the effects of a rule (actions, attributes) run once per change, against the final state', async () => {
        const { el } = await mounted([
            rule({ filter: 'state.qty > 0', fieldName: 'total', expression: 'state.qty * 2' }),
            rule({ action: RuleAction.RunAction, filter: 'state.total > 10', actionId: 'recalculate' }),
        ], { qty: 1 })
        const seen: string[] = []
        el.manageActionRequestedEvent = (e: CustomEvent) => seen.push(e.detail.actionId)

        el.state = { ...el.state, qty: 6 }
        await settle(el)

        expect(seen).toEqual(['recalculate'])
    })

    it('an effect whose filter only held mid-chain, before the values settled, does not run', async () => {
        const { el } = await mounted([
            rule({ filter: 'state.qty > 0', fieldName: 'total', expression: 'state.qty * 2' }),
            rule({ action: RuleAction.RunAction, filter: 'state.total == 2', actionId: 'stale' }),
        ], { qty: 3, total: 6 })
        const seen: string[] = []
        el.manageActionRequestedEvent = (e: CustomEvent) => seen.push(e.detail.actionId)

        // qty 1 → total 2: the settled state matches, the action runs
        el.state = { ...el.state, qty: 1 }
        await settle(el)
        expect(seen).toEqual(['stale'])
        // qty 6 with total still 2 is only the state BEFORE the rule ran: nothing fires
        el.state = { ...el.state, qty: 6 }
        await settle(el)
        expect(seen).toEqual(['stale'])
        expect(el.state.total).toBe(12)
    })

    it('rule-set state triggers the validations, as before', async () => {
        const el = element({
            rules: [rule({ filter: 'state.qty > 5', fieldName: 'total', value: 0 })],
            validations: [{ fieldId: 'total', condition: 'state.total > 0', message: 'Must be positive' }],
        }, { qty: 1 }) as any
        el.data = { _valid: true }
        document.body.appendChild(el)
        await settle(el)
        el.state = { ...el.state, qty: 6 }
        await settle(el)
        expect(el.state.total).toBe(0)
        expect(el.data._valid).toBe(false)
    })
})
