/* Opens/closes the hamburger menu: the left navigator-drawer (HAMBURGUER_MENU) or the floating
 * sections panel (HAMBURGER_SECTIONS). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  // HAMBURGER_SECTIONS: the panel floats over the application, so it also closes with Esc —
  // listened to on the document while it is open, because the focus may not be inside.
  const ESC_KEY = '__mateuSectionsEsc';

  const focusHamburger = () => {
    const button = document.querySelector('#mateuHamburger button') || document.getElementById('mateuHamburger');
    if (button && typeof button.focus === 'function') button.focus();
  };

  class toggleMateuNavDrawer extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  no value = toggle (the hamburger folds/unfolds)
     */
    async run(context, { open }) {
      const { $application } = context;
      const wasOpen = !!$application.variables.mateuNavDrawerOpen;
      const next = open == null ? !wasOpen : !!open;
      const sections = !!$application.variables.mateuMenuSections;
      $application.variables.mateuNavDrawerOpen = next;

      if (sections) {
        if (window[ESC_KEY]) {
          document.removeEventListener('keydown', window[ESC_KEY], true);
          window[ESC_KEY] = null;
        }
        if (next) {
          // the panel starts under the global header (the ✕ stays in view)
          const header = document.getElementById('globalHeader');
          const bottom = header ? Math.round(header.getBoundingClientRect().bottom) : 0;
          if (bottom > 0) document.documentElement.style.setProperty('--mateu-sections-top', bottom + 'px');
          const onKey = (event) => {
            if (event.key !== 'Escape') return;
            event.stopPropagation();
            document.removeEventListener('keydown', onKey, true);
            window[ESC_KEY] = null;
            $application.variables.mateuNavDrawerOpen = false;
            focusHamburger();
          };
          window[ESC_KEY] = onKey;
          document.addEventListener('keydown', onKey, true);
        } else if (wasOpen) {
          focusHamburger();
        }
      }

      if (next) {
        // the navigation-list parses its <ul> on init; the li stamped by
        // oj-bind-for-each arrive later → refresh so it decorates them
        try {
          await Actions.callComponentMethod(context, {
            selector: sections ? '#mateuSectionList' : '#mateuNavList',
            method: 'refresh',
          });
        } catch (ignored) {
          // the first open may arrive before the element exists — the
          // second refresh (after the stamping) is the one that decorates
        }
        if (sections) {
          // the focus enters the panel: the marked section, or the first one
          const list = document.getElementById('mateuSectionList');
          const target = list && (list.querySelector('li.oj-selected a, li[aria-selected="true"] a')
            || list.querySelector('li:not(.oj-disabled) a'));
          if (target) setTimeout(() => target.focus(), 50);
        }
      }
    }
  }

  return toggleMateuNavDrawer;
});
