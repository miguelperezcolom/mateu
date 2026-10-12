/* "Open on mobile": copies the mateu.io/add link to the clipboard and says so through the polite
 * live region (a screen reader hears it; the text field is left selected as the visual cue). */

define([
  'vb/action/actionChain',
  'resources/js/mateu-bridge',
], (
  ActionChain,
  bridge,
) => {
  'use strict';

  class copyMateuMobileQr extends ActionChain {

    async run(context) {
      const url = (context.$page.variables.mateuMobileQrModel || {}).url || '';
      const input = document.getElementById('mateuMobileQrUrl');
      let copied = false;
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(url);
          copied = true;
        }
      } catch (e) { /* not allowed here: the selection below still lets the user copy it */ }
      if (input) {
        input.focus();
        input.select();
        if (!copied) {
          try { copied = document.execCommand('copy'); } catch (e) { copied = false; }
        }
      }
      if (copied) bridge.announce(bridge.chromeText('mobileQrCopied'));
    }
  }

  return copyMateuMobileQr;
});
