/* Guided process (YAML GuidedProcessPage): the template moved to another step (current-step writes
 * back) → project the steps again from the HOST's state plus the page DRAFT (what was typed, kept by
 * hostInputChanged), so a step shows what was typed in it — the atoms carry their values; projected
 * once at load, going back showed the fields empty. */

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

  class onGuidedStepChanged extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  currentStepChanged
     */
    async run(context, { event }) {
      const { $application, $page } = context;

      if (!$application.variables.mateuGp) {
        return;
      }
      const host = (($application.variables.mateuRegistry || {}).contexts || {})[bridge.HOST_ID];
      const gp = host ? bridge.templatedGuidedProcessOf(Object.assign({}, host,
        { state: Object.assign({}, host.state || {}, $page.variables.mateuDraft || {}) })) : null;
      if (gp) {
        $application.variables.mateuGp = gp;
      }
    }
  }

  return onGuidedStepChanged;
});
