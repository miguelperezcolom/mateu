import { describe, expect, it } from 'vitest'
import { comboMatches } from './comboModel'

describe('comboMatches', () => {
    const routes = ['home', 'orders', 'orders/new', 'customers', { value: 'invoices', label: 'Invoices', hint: 'invoices.yaml' }]

    it('shows every option when nothing is typed — the ▾ lists them all', () => {
        expect(comboMatches(routes, '').map((o) => o.value)).toEqual(['home', 'orders', 'orders/new', 'customers', 'invoices'])
        expect(comboMatches(routes, '   ')).toHaveLength(5)
    })

    it('narrows by what is typed, the ones starting with it first, case-insensitive', () => {
        expect(comboMatches(routes, 'ORD').map((o) => o.value)).toEqual(['orders', 'orders/new'])
        expect(comboMatches(routes, 'new').map((o) => o.value)).toEqual(['orders/new'])
        expect(comboMatches(['xhome', 'home'], 'home').map((o) => o.value)).toEqual(['home', 'xhome'])
    })

    it('matches on the label and the hint too', () => {
        expect(comboMatches(routes, 'invoices.yaml').map((o) => o.value)).toEqual(['invoices'])
    })

    it('shows a value once and ignores junk', () => {
        expect(comboMatches(['a', 'a', { value: 'a' }, null as never, { value: 1 } as never], '')).toEqual([{ value: 'a' }])
    })
})

describe('<ve-combo> usage', () => {
    it('is never self-closed: a custom element cannot be, and everything after it would become its hidden children', async () => {
        const { readdirSync, readFileSync, statSync } = await import('fs')
        const { join } = await import('path')
        const root = join(__dirname, '..')
        const files: string[] = []
        const walk = (d: string) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (p.endsWith('.ts') && !p.endsWith('.test.ts')) files.push(p) } }
        walk(root)
        const offenders: string[] = []
        for (const f of files) {
            const s = readFileSync(f, 'utf8')
            let i = s.indexOf('<ve-combo')
            while (i >= 0) {
                let k = i, depth = 0, selfClosed = false
                for (; k < s.length; k++) {
                    // inside a ${…} expression, braces nest (object literals, arrow bodies) and a `>`
                    // (of `=>`) is not the end of the tag
                    if (s.startsWith('${', k)) { depth++; k++; continue }
                    if (s[k] === '{' && depth > 0) { depth++; continue }
                    if (s[k] === '}' && depth > 0) { depth--; continue }
                    if (depth === 0 && s.startsWith('/>', k)) { selfClosed = true; break }
                    if (depth === 0 && s[k] === '>') break
                }
                if (selfClosed) offenders.push(f)
                i = s.indexOf('<ve-combo', k)
            }
        }
        expect(offenders).toEqual([])
    })
})
