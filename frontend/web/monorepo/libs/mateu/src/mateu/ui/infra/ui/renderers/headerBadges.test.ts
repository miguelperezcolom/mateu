// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { render } from 'lit'
import type Badge from '@mateu/shared/apiClients/dtos/componentmetadata/Badge'
import { renderBadgeMetadata } from './badgeRenderer'

/** A status reads the same on the record (content header) as in the listing, where badges are pills. */
describe('a page header badge', () => {
    const theme = (badge: Partial<Badge>, opts?: { pill?: boolean }) => {
        const host = document.createElement('div')
        render(renderBadgeMetadata(badge as Badge, {}, {}, opts), host)
        return host.querySelector('span')!.getAttribute('theme')!.split(/\s+/)
    }

    it('is a pill when the header asks for it', () => {
        expect(theme({ text: 'Confirmed', color: 'SUCCESS' as unknown as Badge['color'] }, { pill: true })).toEqual(expect.arrayContaining(['badge', 'success', 'pill']))
    })

    it('keeps its own shape otherwise', () => {
        expect(theme({ text: 'Confirmed', color: 'SUCCESS' as unknown as Badge['color'] })).not.toContain('pill')
        expect(theme({ text: 'Confirmed', pill: true })).toContain('pill')
    })
})
