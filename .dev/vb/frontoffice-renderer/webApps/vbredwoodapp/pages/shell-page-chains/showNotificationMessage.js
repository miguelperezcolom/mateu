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

  class showNotificationMessage extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {{summary:string,message:string,displayMode:string,type:string,key:string,target:string}} params.event
     */
    async run(context, { event }) {
      const { $page } = context;

      let msg = {
        messageType: event.type === "confirmation" ? "general-success" : "general-"+event.type,
        primaryText: event.summary,
        secondaryText: event.message,
        id: $page.variables.messageId
      };
      $page.variables.messageId++;

      await Actions.fireDataProviderEvent(context, {
        target: $page.variables.messagesBannerADP,
        add: {
          data: msg,
        },
      });

      if (event.displayMode === "transient") {
        setTimeout(() => {
          Actions.fireDataProviderEvent(context, {
            target: $page.variables.messagesBannerADP,
            remove: {
              keys: [msg.id],
            },
          });
        }, 5000);
      }


    }
  }

  return showNotificationMessage;
});
