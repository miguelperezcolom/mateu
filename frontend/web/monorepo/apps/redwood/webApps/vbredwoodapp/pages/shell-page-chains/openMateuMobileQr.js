/* "Open on mobile" (@App(mobileQr)): builds the dialog's model — the mateu.io/add link to THIS UI
 * and screen, its QR (poc/qr.mjs, generated here, in the browser) or, on a phone, the link itself —
 * and opens it. oj-dialog moves the focus in, keeps it there and gives it back on close/Esc. */

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

  class openMateuMobileQr extends ActionChain {

    async run(context) {
      const { $application, $page } = context;
      // the UI's base URL: the mount in path mode (served by the Mateu backend), the configured
      // backend URL when the VB app is served on its own (vb-serve / hosted VB)
      const mount = bridge.mateuBase($application.constants.mateuBaseUrl);
      $page.variables.mateuMobileQrModel = bridge.mobileQrModelOf({
        title: $application.variables.mateuShellTitle || document.title,
        origin: window.location.origin,
        mount,
        route: bridge.currentRouteOf(window.location),
        phone: bridge.isPhoneLike(window),
      });
      await Actions.callComponentMethod(context, { selector: '#mateuMobileQrDialog', method: 'open' });
    }
  }

  return openMateuMobileQr;
});
