import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cardsOf, iconGlyph, isCardsGroup, resolveImageUri, type MenuCardEntry } from './menuCards.ts';

type Entry = MenuCardEntry & { route?: string };

const group: Entry = {
  label: 'Products',
  display: 'cards',
  submenus: [
    { label: 'Orders', description: 'Manage orders', icon: '📦', image: 'images/orders.png', route: '/orders' },
    { separator: true },
    {
      label: 'Billing',
      icon: 'vaadin:money',
      submenus: [
        { label: 'Invoices', route: '/invoices' },
        { label: 'Payments', route: '/payments' },
      ],
    },
  ],
};

test('only a group with display=cards and entries is a cards group', () => {
  assert.equal(isCardsGroup(group), true);
  assert.equal(isCardsGroup({ ...group, display: null }), false);
  assert.equal(isCardsGroup({ label: 'Empty', display: 'cards', submenus: [] }), false);
});

test('each non-separator entry becomes a card: title, text, image, glyph', () => {
  const cards = cardsOf(group, 'http://host:8080/app/');
  assert.equal(cards.length, 2);
  assert.equal(cards[0].title, 'Orders');
  assert.equal(cards[0].description, 'Manage orders');
  assert.equal(cards[0].imageUri, 'http://host:8080/app/images/orders.png');
  assert.equal(cards[0].glyph, '📦');
  assert.equal(cards[0].target?.route, '/orders');
  assert.deepEqual(cards[0].actions, []);
});

test('an entry with submenus is not navigable itself: its submenus are the actions', () => {
  const billing = cardsOf(group, '')[1];
  assert.equal(billing.target, undefined);
  assert.deepEqual(billing.actions.map((a) => a.route), ['/invoices', '/payments']);
  assert.equal(billing.glyph, undefined); // vaadin:money is a DS icon name, not a glyph
});

test('image URIs: data and absolute kept, relative resolved against the backend base', () => {
  assert.equal(resolveImageUri('data:image/png;base64,AAA', 'http://h'), 'data:image/png;base64,AAA');
  assert.equal(resolveImageUri('https://cdn/x.png', 'http://h'), 'https://cdn/x.png');
  assert.equal(resolveImageUri('/x.png', 'http://h/base/'), 'http://h/base/x.png');
  assert.equal(resolveImageUri('', 'http://h'), undefined);
  assert.equal(resolveImageUri(null, 'http://h'), undefined);
});

test('icon glyphs: emoji kept, design-system names dropped', () => {
  assert.equal(iconGlyph('⭐'), '⭐');
  assert.equal(iconGlyph('vaadin:home'), undefined);
  assert.equal(iconGlyph(undefined), undefined);
});
