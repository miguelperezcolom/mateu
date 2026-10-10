// node --test scripts/check-design-tokens.test.mjs — what the visual consistency guard counts.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { stripVarFallbacks, violationsOf } from './check-design-tokens.mjs'

test('a literal as the FALLBACK of a token is fine (the token still wins)', () => {
    assert.equal(stripVarFallbacks('color: var(--lumo-body-text-color, #1a1a1a);'), 'color: var(--token);')
    assert.equal(stripVarFallbacks('x: var(--a, var(--b, rgba(0,0,0,.1)))'), 'x: var(--token)')
    assert.deepEqual(violationsOf('padding: var(--lumo-space-m, 16px); color: var(--x, #fff);'), [])
})

test('hard-coded colours, px spacing and rem font sizes are counted', () => {
    const v = violationsOf([
        '.a { color: #999; }',
        '.b { background: rgba(0, 0, 0, .5); }',
        '.c { padding: 12px; }',
        '.d { font-size: .8rem; }',
    ].join('\n'))
    assert.deepEqual(v.map((x) => x.kind), ['colour', 'colour', 'px', 'font-size'])
})

test('hairlines, comments and justified lines are not counted', () => {
    assert.deepEqual(violationsOf('.a { margin-top: 1px; border: 1px solid; }'), [])
    assert.deepEqual(violationsOf('/* color: #fff */\n// padding: 12px'), [])
    assert.deepEqual(violationsOf('.a { color: #fff; } /* design-token-ok: ink on a dark band */'), [])
})
