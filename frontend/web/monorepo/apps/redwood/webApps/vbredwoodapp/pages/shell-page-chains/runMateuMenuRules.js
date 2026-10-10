/* A menu leaf that RUNS rules (RuleLink) instead of naming a route — reached through
 * onMateuNavigate, where every menu surface (subheader, drawer, topbar, cards) lands. */

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

  class runMateuMenuRules extends ActionChain {

    /**
     * A rule leaf of the menu: a RunAction naming one of the shell's FLOWS runs its lowered
     * commands here, with no server round-trip (bridge.menuRulePlanOf reduces them like any
     * increment); a RunAction the shell declares no flow for is dispatched app-level, as a
     * header action is. The menu selection goes back to the screen that is on display unless
     * the flow navigates somewhere else.
     */
    async run(context, { ruleId }) {
      const { $application } = context;
      const before = $application.variables.mateuRegistry;
      const previousNav = $application.variables.mateuSelectedNavId;
      const rules = bridge.menuRulesOf(((before && before.shell) || {}).menu, ruleId);
      const plan = bridge.menuRulePlanOf(before, rules);
      $application.variables.mateuRegistry = plan.reg;
      if (plan.dirty !== null) {
        $application.variables.mateuDirty = plan.dirty;
      }
      // the bus events of the flow → the OnCustomEvent triggers of the screen on display, run by
      // the CONTENT page (its chain lives there: same route as the error band's Retry)
      const host = plan.reg && plan.reg.contexts && plan.reg.contexts[bridge.HOST_ID];
      for (const busEvent of plan.events) {
        for (const actionId of bridge.eventTriggersOf(host, busEvent.name)) {
          await Actions.fireEvent(context, {
            name: 'application:mateuRetryAction',
            payload: { actionId, parameters: busEvent.detail || {} },
          });
        }
      }
      for (const actionId of plan.serverActions) {
        await Actions.callChain(context, { chain: 'runMateuHeaderAction', params: { actionId } });
      }
      if (plan.navigate && plan.navigate.url) {
        window.open(plan.navigate.url, '_blank', 'noopener');
      } else if (plan.navigate && plan.navigate.route) {
        await Actions.callChain(context, {
          chain: 'onMateuNavigate',
          params: { event: { route: plan.navigate.route }, force: true },
        });
        return;
      }
      $application.variables.mateuSelectedNavId = previousNav;
    }

  }

  return runMateuMenuRules;
});
