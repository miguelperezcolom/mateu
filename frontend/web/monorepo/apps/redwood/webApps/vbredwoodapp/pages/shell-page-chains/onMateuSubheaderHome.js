/* Click on the subheader's title. MENU_ON_TOP: goes back to the App's home, like the title of the
 * web renderer's band 2. HAMBURGER_SECTIONS: the title is that of the section on screen, and leads to
 * the section's home (its first screen). It is a <button> that looks like a title and not a link: the
 * chain runs asynchronously and would not manage to cancel an href's default navigation. */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  Actions,
  bridge,
) => {
  'use strict';

  class onMateuSubheaderHome extends ActionChain {

    /**
     * @param {Object} context
     */
    async run(context) {
      const { $application } = context;
      if ($application.variables.mateuMenuSections) {
        const section = bridge.sectionOf($application.variables.mateuMenuTree, $application.variables.mateuSelectedNavId);
        if (section && section.home) {
          await Actions.callChain(context, {
            chain: 'onMateuNavigate',
            params: { event: { detail: { currentId: section.home } } },
          });
        }
        return;
      }
      const route = $application.variables.mateuHomeRoute;
      if (!route) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'onMateuNavigate',
        params: { event: { detail: { route } } },
      });
    }
  }

  return onMateuSubheaderHome;
});
