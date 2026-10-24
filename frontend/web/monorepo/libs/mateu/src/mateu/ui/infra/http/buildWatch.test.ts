import { beforeEach, describe, expect, it } from 'vitest'
import {
    backendKeyOf, buildOf, BuildWatch, buildWatch, isMarkedStaleScreen, isStaleScreenRefusal,
    observeMateuResponse, STALE_SCREEN,
} from './buildWatch'
import { classifyRequestFailure } from './requestPolicy'

describe('backend key', () => {
    it('is the absolute URL up to the /mateu/ segment', () => {
        expect(backendKeyOf('https://a.example/shop/mateu/v3/sync/orders')).toBe('https://a.example/shop')
        expect(backendKeyOf('https://a.example/mateu/v3/sse/_no_route')).toBe('https://a.example')
    })
    it('resolves a relative URL against the page', () => {
        expect(backendKeyOf('/crm/mateu/v3/sync/x', 'https://host.example/page')).toBe('https://host.example/crm')
        expect(backendKeyOf('mateu/v3/sync/x', 'https://host.example/')).toBe('https://host.example')
    })
    it('has none for a URL that is not a Mateu endpoint', () => {
        expect(backendKeyOf('https://api.example/countries', 'https://host.example/')).toBeUndefined()
    })
})

describe('build header', () => {
    it('reads axios-like plain maps case-insensitively, and fetch Headers', () => {
        expect(buildOf({ 'x-mateu-build': 'b1' })).toBe('b1')
        expect(buildOf({ 'X-Mateu-Build': ' b2 ' })).toBe('b2')
        expect(buildOf(new Headers({ 'X-Mateu-Build': 'b3' }))).toBe('b3')
    })
    it('is absent when missing or blank', () => {
        expect(buildOf(undefined)).toBeUndefined()
        expect(buildOf({})).toBeUndefined()
        expect(buildOf({ 'x-mateu-build': '  ' })).toBeUndefined()
        expect(buildOf(new Headers())).toBeUndefined()
    })
})

describe('build watch', () => {
    let watch: BuildWatch
    beforeEach(() => { watch = new BuildWatch() })

    it('takes the first build as the baseline and stays quiet while it matches', () => {
        expect(watch.observe('k', 'b1')).toBe('none')
        expect(watch.observe('k', 'b1')).toBe('none')
    })
    it('reports an update once per backend and keeps the old baseline', () => {
        watch.observe('k', 'b1')
        expect(watch.observe('k', 'b2')).toBe('updated')
        expect(watch.observe('k', 'b2')).toBe('none')
        expect(watch.observe('k', 'b3')).toBe('none')
        // the baseline did not move: a refusal from the new build is still a stale screen
        expect(watch.observe('k', 'b2', true)).toBe('stale')
        expect(watch.observe('k', 'b1', true)).toBe('none')
    })
    it('keeps backends apart', () => {
        watch.observe('a', 'b1')
        watch.observe('b', 'x1')
        expect(watch.observe('a', 'b2')).toBe('updated')
        expect(watch.observe('b', 'x2')).toBe('updated')
    })
    it('a stale refusal stands in for the update notice', () => {
        watch.observe('k', 'b1')
        expect(watch.observe('k', 'b2', true)).toBe('stale')
        expect(watch.observe('k', 'b2')).toBe('none')
    })
    it('a refusal with the same build, or before any baseline, is an ordinary refusal', () => {
        expect(watch.observe('k', 'b1', true)).toBe('none')
        expect(watch.observe('k', 'b1', true)).toBe('none')
    })
    it('does nothing without a header or a key', () => {
        expect(watch.observe('k', undefined)).toBe('none')
        expect(watch.observe(undefined, 'b1')).toBe('none')
        watch.observe('k', 'b1')
        expect(watch.observe('k', undefined, true)).toBe('none')
    })
})

describe('transport hooks', () => {
    beforeEach(() => buildWatch.reset())
    const url = 'https://app.example/mateu/v3/sync/orders'

    it('shows the update notice once', () => {
        let shown = 0
        const show = () => { shown++ }
        observeMateuResponse(url, { 'x-mateu-build': 'b1' }, show)
        observeMateuResponse(url, { 'x-mateu-build': 'b2' }, show)
        observeMateuResponse(url, { 'x-mateu-build': 'b2' }, show)
        expect(shown).toBe(1)
    })
    it('a stale Mateu refusal is told as a stale screen with a reload', () => {
        observeMateuResponse(url, { 'x-mateu-build': 'b1' }, () => undefined)
        expect(isStaleScreenRefusal(url, { 'x-mateu-build': 'b2' })).toBe(true)
        const error = { response: { status: 403, data: 'Forbidden' }, [STALE_SCREEN]: true }
        expect(isMarkedStaleScreen(error)).toBe(true)
        const failure = classifyRequestFailure(error, { online: true })
        expect(failure.kind).toBe('forbidden')
        expect(failure.reload).toBe(true)
        expect(failure.message).toContain('Reload')
    })
    it('an unmarked refusal keeps the forbidden text', () => {
        const failure = classifyRequestFailure({ response: { status: 403, data: 'Forbidden' } }, { online: true })
        expect(failure.reload).toBeUndefined()
        expect(failure.message).not.toContain('Reload')
    })
})
