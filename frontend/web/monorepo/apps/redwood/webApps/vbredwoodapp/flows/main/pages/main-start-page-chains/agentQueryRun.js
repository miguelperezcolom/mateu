/* LIVE UI PUSH — an MCP agent reads or operates the screen on show (a `query` message: describe-screen,
 * set-fields, run-action; the shell hands it over with application:mateuAgentQuery). The page owns
 * the drafts and the chains a user's edit or click goes through, so the query runs HERE: the bridge
 * (poc/agentPush.mjs runAgentQuery) summarises what is drawn, types into the inputs or presses the
 * action exactly as the user would, waits for the screen to settle and answers _agent-screen. */

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

  class agentQueryRun extends ActionChain {

    /**
     * @param {Object} context
     * @param {Object} params
     * @param {Object} params.query  {event, requestId, values?, actionId?, parameters?, row?, listing?}
     */
    async run(context, { query }) {
      const { $application, $page } = context;
      await bridge.runAgentQuery(query, bridge.agentPageOps({
        app: $application.variables,
        page: $page.variables,
        doc: document,
        callChain: (chain, params) => Actions.callChain(context, { chain, params }),
      }));
    }
  }

  return agentQueryRun;
});
