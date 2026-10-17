/* «Add selected» of a multi-valued @Searchable's SELECTOR: the checked rows travel in
 * crud_selected_items (action-on-row-select-selected); the server adds them to the field's ids. */

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

  class mateuPickerAdd extends ActionChain {

    async run(context) {
      const { $page } = context;
      const picker = $page.variables.mateuPicker || {};
      const rows = bridge.selectedRowsOf($page.variables.mateuPickerRows || [], $page.variables.mateuPickerSelection);
      if (!rows.length) {
        $page.variables.mateuToastText = 'You first need to select some rows';
        await Actions.callComponentMethod(context, { selector: '#mateuToast', method: 'open' });
        return;
      }
      await Actions.callChain(context, {
        chain: 'runMateuAction',
        params: { actionId: picker.addActionId, parameters: { crud_selected_items: rows } },
      });
    }
  }

  return mateuPickerAdd;
});
