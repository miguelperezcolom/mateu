/* Dictating to the chat: the microphone button (only where the browser has speech recognition — see
 * toggleMateuChat, which decides it when opening the panel). Pressing it listens for one sentence; what is
 * recognized goes to the message field and is sent, as in the shared chat. Pressing it while listening stops it.
 *
 * Sending is done by pressing the panel's Send button, the same path as Enter: the result
 * arrives in a browser callback, outside the chain, and from there a callChain is not reliable. */
define(['vb/action/actionChain', 'resources/js/mateu-bridge'], (ActionChain, bridge) => {
  'use strict';

  let recognition = null;

  const inputEl = () => document.querySelector('#mateuChatInput textarea, #mateuChatInput input');

  function recognizer($application) {
    if (recognition) return recognition;
    const Ctor = bridge.speechRecognitionCtor(window);
    if (!Ctor) return null;
    recognition = new Ctor();
    recognition.lang = document.documentElement.lang || navigator.language || 'es-ES';
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const text = bridge.transcriptOf(event);
      if (!text) return;
      $application.variables.mateuChatInput = text;
      const oj = document.querySelector('#mateuChatInput');
      if (oj) oj.value = text;
      const el = inputEl();
      if (el) el.value = text;
      const send = document.querySelector('#mateuChatSend');
      if (send) send.click();
    };
    // one sentence and it ends; an error (permission denied, no microphone, silence) also ends it
    recognition.onend = () => { $application.variables.mateuChatListening = false; };
    recognition.onerror = () => { $application.variables.mateuChatListening = false; };
    return recognition;
  }

  class chatMic extends ActionChain {
    async run(context) {
      const { $application } = context;
      const rec = recognizer($application);
      if (!rec) { $application.variables.mateuChatMicAvailable = false; return; }
      if ($application.variables.mateuChatListening) {
        rec.stop();
        $application.variables.mateuChatListening = false;
        return;
      }
      try {
        rec.start();
        $application.variables.mateuChatListening = true;
      } catch (e) {
        // start() on one already listening throws InvalidStateError: it stays as it is
      }
    }
  }
  return chatMic;
});
