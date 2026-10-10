import { describe, expect, it } from 'vitest'
import { cardsOf, isCardsGroup } from './mateu-card-menu'

describe('card menus', () => {
    const group = {
        text: 'Bookings', display: 'cards',
        children: [
            { text: 'Reservations', description: 'Search and create', icon: 'vaadin:calendar', image: '/img/r.png',
              children: [{ text: 'Search', route: '/r' }, { component: 'hr' }, { text: 'New', route: '/r/new' }] },
            { text: 'Room diary', description: 'Rooms by day', route: '/diary' },
            { component: 'hr' },
        ],
    }

    it('a group with display cards and entries is a cards group; a plain group is not', () => {
        expect(isCardsGroup(group)).toBe(true)
        expect(isCardsGroup({ text: 'X', children: [{ text: 'a' }] })).toBe(false)
        expect(isCardsGroup({ text: 'X', display: 'cards', children: [] })).toBe(false)
    })

    it('each entry is a card; an entry with children is not navigable and its children are its actions', () => {
        const cards = cardsOf(group)
        expect(cards.map((c) => c.title)).toEqual(['Reservations', 'Room diary'])
        expect(cards[0]).toMatchObject({ description: 'Search and create', icon: 'vaadin:calendar', image: '/img/r.png', navigable: false })
        expect(cards[0].actions.map((a) => a.text)).toEqual(['Search', 'New'])
        expect(cards[1]).toMatchObject({ navigable: true, actions: [] })
    })
})
