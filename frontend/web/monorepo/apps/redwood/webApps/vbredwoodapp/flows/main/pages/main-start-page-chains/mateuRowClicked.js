/* Click on a listing row (oj-table's ojRowAction): resolves the row and fires the crud's
 * 'view' action with the row as parameters — the server answers with the Edit drawer.
 * ojRowAction is used and not the selection (the selection leaves state the table re-emits on
 * refreshing after a save). DEDUPE by timeStamp: the VB runtime may RE-INVOKE the listener
 * with the same stored event after the listing refreshes (race observed: a ghost 'view'
 * ~30ms after the save reopened the drawer; at DOM level there was only ONE ojRowAction). */

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

  let lastHandledStamp = -1;

  class mateuRowClicked extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.event  ojRowAction ({detail: {context: {key, item…}}}), or the
     *   ojAction of a listing CARD (gridLayout = cards), which brings its row as `rowKey`
     * @param {string} [params.rowKey]  the card's row key (_rowNumber, from data-row-key)
     */
    async run(context, { event, rowKey }) {
      const { $application } = context;

      const listing = $application.variables.mateuListing;
      const detail = (event && event.detail) || {};
      // WHOLE-ROW CLICK (decision U1): the whole row opens the record, except cells with a click
      // of their own — a row BUTTON (the queue's «Open»), a link, the selection checkbox,
      // an inline EDITOR (in a work table only those cells are edited; the rest opens) or a
      // display column (class mateu-cell-noopen, precomputed in listingOf). See rowActionIsRows.
      const origin = detail.originalEvent && detail.originalEvent.target;
      // a CARD is itself a control (oj-action-card): only a control inside it is not the row's
      const card = rowKey != null && rowKey !== '' ? event && event.target : null;
      if (!bridge.rowActionIsRows(origin, card)) {
        return;
      }
      const stamp = (detail.originalEvent && detail.originalEvent.timeStamp) || event.timeStamp || 0;
      if (stamp === lastHandledStamp) {
        return; // replay of the same event — not a new click
      }
      lastHandledStamp = stamp;

      // a CARD names its row by key; a table row brings its context
      const rowContext = detail.context || (rowKey != null && rowKey !== '' ? { key: rowKey } : {});
      let row = rowContext.item && rowContext.item.data;
      if (!row && rowContext.key != null) {
        const rows = $application.variables.mateuListingRows || [];
        row = rows.find((r) => String(r._rowNumber) === String(rowContext.key));
      }
      if (!row || row._group) {
        return; // a GROUP row (@GroupBy) is presentation only: it neither opens nor navigates
      }
      // Row DETAILS (@Details) in a query listing: the click opens them in their panel instead
      // of asking for a 'view' that leads nowhere. A navigable row still opens the record.
      if (listing && listing.detailPath && !listing.navigable) {
        const value = row[listing.detailPath];
        const first = (listing.columns || [])[0];
        const title = first && row[first.field] != null ? row[first.field] : '';
        $application.variables.mateuRowDetail = {
          title: typeof title === 'object' ? (title.message || '') : String(title),
          text: value == null ? '' : (typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)),
        };
        $application.variables.mateuRowDetailOpen = true;
        return;
      }
      // @RowRoute: the row opens a ROUTE (the master of a record with tabs that are pages)
      const rowRoute = listing && listing.rowRoute ? bridge.rowRouteOf(listing.rowRoute, row) : '';
      if (rowRoute) {
        await Actions.fireEvent(context, { name: 'application:mateuNavigate', payload: { route: rowRoute } });
        return;
      }
      // a listing that offers no way into a record (@NotNavigable, a board you select rows on):
      // the click is not a 'view' — asking for one rendered a record page the crud never offered
      if (!bridge.rowClickOpensRecord(listing)) {
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        // the row as the server sent it: not the cells precomputed for the templates (an enum's
        // label, a clipped text, a status badge)
        params: { actionId: 'view', parameters: bridge.rowAsArrived(row) },
      });
    }
  }

  return mateuRowClicked;
});
