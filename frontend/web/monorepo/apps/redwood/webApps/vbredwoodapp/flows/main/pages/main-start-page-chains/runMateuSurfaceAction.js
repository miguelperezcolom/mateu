/* An action of a surface of its own inside the content — a MicroFrontend, loaded from ITS backend,
 * or an INLINE island (a form's component field holding a ServerSide: bridge.runSurfaceAction posts
 * it with the island's class, reduces the answer, delivers the bus events it emitted to the page and
 * the other islands by @SubscribeTo scope, and registers the islands a host re-render brought) —
 * then the content is projected again (poc/reproject.mjs) and its messages shown. Like a page
 * action it asks its confirmation first (confirmationRequired), opens the overlays the answer
 * brought (Dialog → the modal, Drawer → the drawer panel: bridge.surfaceOverlayVarsOf) and asks a
 * RETURNED ConfirmDialog, running the pick on the same surface. */

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

  class runMateuSurfaceAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.surfaceId
     * @param {string} params.actionId
     * @param {Object} params.parameters
     */
    async run(context, { surfaceId, actionId, parameters }) {
      const { $application, $page } = context;
      const before = $application.variables.mateuRegistry;
      const confirmation = bridge.confirmationOf((before.contexts || {})[surfaceId], actionId);
      if (confirmation) {
        $page.variables.mateuConfirm = confirmation;
        const answer = bridge.awaitConfirmation();
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'open' });
        if (!(await answer)) return;
      }
      let reg;
      try {
        reg = await bridge.runSurfaceAction(before, surfaceId, actionId, parameters,
          { appState: $application.variables.mateuAppState || {} });
      } catch (e) {
        if (bridge.isStaleResponse(e)) return;
        throw e;
      }
      bridge.applyDomEffects(reg.effects || {}, reg);
      $application.variables.mateuRegistry = reg;
      const next = bridge.reprojectedContentOf($application.variables);
      if (next.hostContent) {
        $application.variables.mateuHostContent = next.hostContent;
        bridge.mountElementsSoon(bridge.elementAtomsOf(next.hostContent));
      }
      const overlay = bridge.surfaceOverlayVarsOf(before, reg);
      if (overlay.changed) {
        $application.variables.mateuDrawer = overlay.drawer;
        $application.variables.mateuDialog = overlay.dialog;
        $application.variables.mateuDrawerOpen = overlay.drawerOpen;
        if (bridge.drawerChangedBetween(before, reg)) {
          $page.variables.mateuDrawerDraft = {};
          $page.variables.mateuDrawerState = 'auto';
          $page.variables.mateuDrawerLeaving = null;
        }
        if (overlay.modal && !$page.variables.mateuModalOpen) {
          $page.variables.mateuModalOpen = true;
          await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'open' });
        } else if (!overlay.modal && $page.variables.mateuModalOpen) {
          $page.variables.mateuModalOpen = false;
          await Actions.callComponentMethod(context, { selector: '#mateuModal', method: 'close' });
        }
      }
      for (const toast of (reg.effects && reg.effects.toasts) || []) {
        const notification = bridge.bannerNotificationOf(toast);
        if (notification) { await Actions.fireNotificationEvent(context, notification); continue; }
        $page.variables.mateuToastText = toast.text;
        await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
      }
      const returned = (reg.effects && reg.effects.returnedConfirms) || [];
      if (returned.length) {
        const ask = $page.variables.mateuConfirm = returned[returned.length - 1];
        const answer = bridge.awaitConfirmation();
        await Actions.callComponentMethod(context, { selector: '#mateuConfirm', method: 'open' });
        const chosen = (await answer) ? ask.confirmActionId : ask.denyActionId;
        if (chosen) {
          await Actions.callChain(context, { chain: 'runMateuSurfaceAction', params: { surfaceId, actionId: chosen, parameters: {} } });
        }
      }
      // a NavigateTo of the surface (its server answer, or a client flow it ran): the page's router
      const navigate = reg.effects && reg.effects.navigate;
      if (navigate && navigate.url) {
        window.open(navigate.url, '_blank', 'noopener');
      } else if (navigate && navigate.route && !bridge.leftMountFor(navigate, $application.variables.mateuRegistry)) {
        await Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route: navigate.route, force: true } });
      }
    }
  }

  return runMateuSurfaceAction;
});
