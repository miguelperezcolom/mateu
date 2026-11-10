import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cssColor, cssLength, cssToRn, BOX_LOOKS } from './cssStyle.ts';
import { applyTheme, theme } from '../theme.ts';

test('lengths: px, rem, %, a leading dot, a Lumo space', () => {
  assert.equal(cssLength('16px'), 16);
  assert.equal(cssLength('1.5rem'), 24);
  assert.equal(cssLength('.5rem'), 8);
  assert.equal(cssLength('50%'), '50%');
  assert.equal(cssLength('0'), 0);
  assert.equal(cssLength('var(--lumo-space-m)'), 16);
  assert.equal(cssLength('calc(100% - 1rem)'), null);
  assert.equal(cssLength('12'), null);
});

test('a Lumo colour becomes the theme token (follows dark mode), a literal stays', () => {
  applyTheme('light');
  assert.equal(cssColor('var(--lumo-contrast-5pct, #f3f3f3)'), theme.background);
  assert.equal(cssColor('var(--lumo-primary-color-10pct, #e8f0fe)'), theme.primaryContainer);
  assert.equal(cssColor('var(--unknown, #abcdef)'), '#abcdef');
  assert.equal(cssColor('#fff'), '#fff');
  assert.equal(cssColor('linear-gradient(red, blue)'), null);
});

test('a container style: background, padding, radius, border, flex-grow', () => {
  applyTheme('light');
  assert.deepEqual(cssToRn('background: var(--lumo-contrast-5pct, #f3f3f3); padding: 1rem; border-radius: 8px;flex-grow: 2;'), {
    backgroundColor: theme.background, paddingTop: 16, paddingRight: 16, paddingBottom: 16, paddingLeft: 16, borderRadius: 8, flexGrow: 2,
  });
  assert.deepEqual(cssToRn('border-left: 4px solid #1676f3; padding: .5rem 1rem;'), {
    borderLeftWidth: 4, borderLeftColor: '#1676f3', paddingTop: 8, paddingRight: 16, paddingBottom: 8, paddingLeft: 16,
  });
  assert.deepEqual(cssToRn('height: 9rem; max-width: 24rem; width: 100%'), { height: 144, maxWidth: 384, width: '100%' });
});

test('what cannot be mapped is left out; `only` keeps a subset', () => {
  assert.deepEqual(cssToRn('min-width: min(20rem, 100%); position: sticky; display: grid'), {});
  assert.deepEqual(cssToRn('padding: 4px; width: 10rem', BOX_LOOKS), { paddingTop: 4, paddingRight: 4, paddingBottom: 4, paddingLeft: 4 });
  assert.deepEqual(cssToRn('flex: 0 0 22rem'), { flexGrow: 0, flexShrink: 0, flexBasis: 352 });
  assert.deepEqual(cssToRn('flex: 1'), { flexGrow: 1, flexBasis: 0 });
});
