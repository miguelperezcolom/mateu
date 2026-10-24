/* The events of the drawer panel's Spectra template (oj-sp-general / create-edit / bottom drawer
 * template, chosen by tree.mjs spectraDrawerOf): its footer buttons run the drawer's own actions,
 * its arrows walk the peers, and leaving a create/edit drawer with unsaved changes asks first —
 * through the template's unsaved-changes banner (the Spectra contract: the app sets
 * `unsavedChanges`, the banner answers Discard / Cancel).
 *
 *   primary | secondary | andNext   → the mapped wire action (save, «Save and next»…)
 *   cancel | leave (Esc/outside)    → the form's cancel action / closing — held while unsaved
 *   previous | next                 → the peer: a listing row (crud drawer) or a PeerNav route
 *   discard | keep                  → the banner's answers
 *   state                           → drawerState written back ('closed' = the bottom drawer's ✕)
 */

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

  class mateuDrawerTemplateAction extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {string} params.kind    what the template asked (see above)
     * @param {string} [params.itemId] the item / secondary action id / new drawerState
     */
    async run(context, { kind, itemId }) {
      const { $application, $page } = context;
      const drawer = $application.variables.mateuDrawer || {};
      const sp = drawer.sp || {};
      const unsaved = sp.isCreateEdit && bridge.drawerHasUnsavedChanges(drawer, $page.variables.mateuDrawerDraft);

      switch (kind) {
        case 'primary':
          return this.runAction(context, sp.primaryActionId);
        case 'andNext':
          return this.runAction(context, sp.saveAndNextActionId || sp.primaryActionId);
        case 'secondary':
          return this.runAction(context, sp.isGeneral ? itemId : sp.secondaryActionId);
        case 'cancel':
        case 'leave':
          if (unsaved) {
            $page.variables.mateuDrawerLeaving = { kind: kind === 'cancel' ? 'cancel' : 'close' };
            return undefined;
          }
          return this.leave(context, { kind: kind === 'cancel' ? 'cancel' : 'close' });
        case 'previous':
        case 'next':
          if (!itemId || itemId === '-') return undefined;
          if (unsaved) {
            $page.variables.mateuDrawerLeaving = { kind: 'peer', itemId };
            return undefined;
          }
          return this.leave(context, { kind: 'peer', itemId });
        case 'discard': {
          // a COPY: a VB variable read is a live view of the store, gone once the variable is reset
          const pending = Object.assign({ kind: 'close' }, $page.variables.mateuDrawerLeaving || {});
          $page.variables.mateuDrawerLeaving = null;
          $page.variables.mateuDrawerDraft = {};
          bridge.noteDrawerUnsaved(false);
          // the edits are dropped on purpose: the leave action must not ask a second time (the
          // drawer's own scope — the page behind keeps its unsaved changes, if it has any)
          $application.variables.mateuRegistry = bridge.withOverlayDirty($application.variables.mateuRegistry, false);
          return this.leave(context, pending);
        }
        case 'keep':
          $page.variables.mateuDrawerLeaving = null;
          return undefined;
        case 'state':
          // the bottom drawer's ✕ writes back 'closed': the overlay goes, as with Esc
          if (itemId === 'closed') return this.leave(context, { kind: 'close' });
          return undefined;
        default:
          return undefined;
      }
    }

    async leave(context, pending) {
      const { $application } = context;
      // the template is the authority on this drawer's unsaved changes (the draft against the values
      // it opened with): past its banner — or with nothing it counts as unsaved, e.g. a value typed
      // back — the leave action does not ask again through the navigation question
      $application.variables.mateuRegistry = bridge.withOverlayDirty($application.variables.mateuRegistry, false);
      const drawer = $application.variables.mateuDrawer || {};
      const sp = drawer.sp || {};
      if (pending.kind === 'cancel' && sp.cancelActionId) {
        return this.runAction(context, sp.cancelActionId);
      }
      if (pending.kind === 'peer') {
        // a crud drawer walks the listing rows: the next record opens in the SAME drawer (the server
        // re-sends it with its id, which refreshes it in place)
        if (sp.listingPeers) {
          const rows = $application.variables.mateuListingRows || [];
          const row = rows.find((r) => r && r.id != null && String(r.id) === String(pending.itemId));
          if (!row) return undefined;
          // the row's 'view' is the LISTING's (a row click): sent from the drawer it would carry the
          // drawer's state, whose id wins over the row's on the server — so the open drawer leaves the
          // registry first (the panel stays up: the answer re-sends it for the new record)
          const before = $application.variables.mateuRegistry;
          $application.variables.mateuRegistry = bridge.dismissOverlayById(before, drawer.id);
          try {
            return await this.runAction(context, 'view', bridge.rowAsArrived(row));
          } catch (e) {
            $application.variables.mateuRegistry = before;
            throw e;
          }
        }
        // a PeerNav route navigates like a breadcrumb — the drawer goes first
        await Actions.callChain(context, { chain: 'mateuDrawerDismissed' });
        document.dispatchEvent(new CustomEvent('navigation-requested', {
          detail: { route: pending.itemId }, bubbles: true, composed: true,
        }));
        return undefined;
      }
      return Actions.callChain(context, { chain: 'mateuDrawerDismissed' });
    }

    async runAction(context, actionId, parameters) {
      if (!actionId) return undefined;
      return Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId, parameters: parameters || {} },
      });
    }
  }

  return mateuDrawerTemplateAction;
});
