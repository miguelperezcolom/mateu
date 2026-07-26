/* Copyright (c) 2026, Oracle and/or its affiliates */

define([
  'vb/action/actionChain',
  'vb/action/actions',
  'vb/action/actionUtils',
], (
  ActionChain,
  Actions,
) => {
  'use strict';

  class showMessageToast extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{message:string}} params.event
     */
    async run(context, { event }) {
      const { $page } = context;

      $page.variables.messageToast = event.message;

      await Actions.callComponentMethod(context, {
        selector: '#messageToast',
        method: 'open',
      });

    }
  }

  return showMessageToast;
});
