import assert from 'node:assert/strict'
import { overflowedOf } from './subheaderOverflow.mjs'

const leaf = (width) => ({ width, leaf: true })

// all fit: nothing moves, and the button takes no room
assert.deepEqual(overflowedOf([leaf(100), leaf(100)], 200, 60), [])
// the last ones go, in order, until the rest and the button fit
assert.deepEqual(overflowedOf([leaf(100), leaf(100), leaf(100), leaf(100)], 300, 60), [2, 3])
assert.deepEqual(overflowedOf([leaf(100), leaf(100), leaf(100)], 299, 60), [2])
// a group stays where it is, with its dropdown; the leaves before it go instead
assert.deepEqual(overflowedOf([leaf(100), leaf(100), { width: 100, leaf: false }], 220, 60), [0, 1])
// nothing but groups: nothing to move
assert.deepEqual(overflowedOf([{ width: 300, leaf: false }], 100, 60), [])
console.log('subheader overflow: ok')
