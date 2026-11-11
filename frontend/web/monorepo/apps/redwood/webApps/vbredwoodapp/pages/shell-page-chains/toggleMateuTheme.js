/* The light/dark switch of the header (@App(themeToggle)): bridge.toggleTheme (poc/theme.mjs)
 * flips JET's inverted colour scheme on the page and remembers the choice in
 * localStorage['mateu-theme'] — the same key the Vaadin renderer reads. */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class toggleMateuTheme extends ActionChain {
    async run() {
      bridge.toggleTheme();
    }
  }

  return toggleMateuTheme;
});
