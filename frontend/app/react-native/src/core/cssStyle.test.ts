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

test('every Lumo colour variable maps onto a theme token, in both schemes', () => {
  const expected: Record<string, keyof typeof theme> = {
    'lumo-base-color': 'surface', 'lumo-contrast-5pct': 'background', 'lumo-contrast-10pct': 'divider',
    'lumo-contrast-20pct': 'border', 'lumo-contrast-30pct': 'border', 'lumo-contrast-50pct': 'faint',
    'lumo-contrast-60pct': 'muted', 'lumo-contrast-70pct': 'muted', 'lumo-contrast-80pct': 'ink',
    'lumo-contrast-90pct': 'ink', 'lumo-contrast': 'ink', 'lumo-body-text-color': 'ink',
    'lumo-header-text-color': 'ink', 'lumo-secondary-text-color': 'muted', 'lumo-tertiary-text-color': 'faint',
    'lumo-primary-color': 'primary', 'lumo-primary-text-color': 'primary', 'lumo-primary-color-10pct': 'primaryContainer',
    'lumo-primary-color-50pct': 'primary', 'lumo-success-color': 'success', 'lumo-success-text-color': 'success',
    'lumo-success-color-10pct': 'successBg', 'lumo-warning-color': 'warning', 'lumo-warning-text-color': 'warning',
    'lumo-warning-color-10pct': 'warningBg', 'lumo-error-color': 'danger', 'lumo-error-text-color': 'danger',
    'lumo-error-color-10pct': 'dangerBg',
  };
  for (const scheme of ['light', 'dark'] as const) {
    applyTheme(scheme);
    for (const [name, token] of Object.entries(expected)) {
      // the fallback is never used for a known variable: the token follows the scheme
      assert.equal(cssColor(`var(--${name}, #123456)`), theme[token], `${scheme} ${name}`);
    }
  }
  applyTheme('light');
});

test('size bounds and gaps are camel-cased; auto only for width/height; border keywords and radius', () => {
  assert.deepEqual(cssToRn('min-width: 10rem; min-height: 2rem; row-gap: 4px; column-gap: var(--lumo-space-s)'), {
    minWidth: 160, minHeight: 32, rowGap: 4, columnGap: 8,
  });
  assert.deepEqual(cssToRn('width: auto; max-height: auto'), { width: 'auto' });
  assert.deepEqual(cssToRn('border: 1px dashed var(--lumo-contrast-20pct, #ddd); border-radius: 50%'), {
    borderWidth: 1, borderColor: theme.border, borderStyle: 'dashed', borderRadius: 9999,
  });
  assert.deepEqual(cssToRn('border: none; margin-inline: 4px 8px; padding-block: 2px'), {
    borderWidth: 0, marginLeft: 4, marginRight: 8, paddingTop: 2, paddingBottom: 2,
  });
  assert.deepEqual(cssToRn('opacity: .5; align-self: end; flex-shrink: 0; color: inherit'), { opacity: 0.5, alignSelf: 'flex-end', flexShrink: 0 });
});
