/* Abre/cierra el menú de la hamburguesa: el navigator-drawer izquierdo (HAMBURGUER_MENU) o el panel
 * flotante de las secciones (HAMBURGER_SECTIONS). */

define([
  'vb/action/actionChain',
  'vb/action/actions',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  // HAMBURGER_SECTIONS: el panel flota sobre la aplicación, así que se cierra también con Esc —
  // escuchado en el documento mientras está abierto, porque el foco puede no estar dentro.
  const ESC_KEY = '__mateuSectionsEsc';

  const focusHamburger = () => {
    const button = document.querySelector('#mateuHamburger button') || document.getElementById('mateuHamburger');
    if (button && typeof button.focus === 'function') button.focus();
  };

  class toggleMateuNavDrawer extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {boolean} params.open  sin valor = alternar (la hamburguesa pliega/despliega)
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
          // el panel arranca bajo la cabecera global (la ✕ queda a la vista)
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
        // el navigation-list parsea su <ul> en el init; los li estampados por
        // oj-bind-for-each llegan después → refresh para que los decore
        try {
          await Actions.callComponentMethod(context, {
            selector: sections ? '#mateuSectionList' : '#mateuNavList',
            method: 'refresh',
          });
        } catch (ignored) {
          // el primer open puede llegar antes de que el elemento exista — el
          // segundo refresh (tras el stamping) es el que decora
        }
        if (sections) {
          // el foco entra en el panel: la sección marcada, o la primera
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
