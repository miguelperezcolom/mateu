/* Dictar al chat: el botón del micrófono (solo donde el navegador tiene reconocimiento de voz — ver
 * toggleMateuChat, que lo decide al abrir el panel). Pulsarlo escucha una frase; lo reconocido va al
 * campo del mensaje y se envía, como en el chat compartido. Pulsarlo mientras escucha lo para.
 *
 * El envío se hace pulsando el botón Enviar del panel, el mismo camino que el Enter: el resultado
 * llega en un callback del navegador, fuera de la chain, y desde ahí un callChain no es fiable. */
define(['vb/action/actionChain', 'resources/js/mateu-bridge'], (ActionChain, bridge) => {
  'use strict';

  let recognition = null;

  const inputEl = () => document.querySelector('#mateuChatInput input');

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
    // una frase y se acaba; un error (permiso denegado, sin micrófono, silencio) también la acaba
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
        // start() sobre uno que ya escucha lanza InvalidStateError: se queda como está
      }
    }
  }
  return chatMic;
});
