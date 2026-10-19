/**
 * THE way an agent's UI event is applied — the assistant chat's stream events and the live-push
 * channel's messages go through this one function, so a pushed `render-screen` / `navigation-
 * requested` / custom event does exactly what the same event from the chat does:
 *  - render-screen: a subscriber on the session bus first, else the shell's own render target
 *    (`__preview__` → content area, drawer or dialog);
 *  - navigation-requested: like a menu click carrying those fields;
 *  - close-requested: closes the assistant;
 *  - anything else: the session event bus (@SubscribeTo / OnCustomEvent).
 */
import { applyChatEvent, previewActionOf, type ChatEventHooks, type ChatEventOutcome, type ChatUiEvent } from './chatStream.ts';
import type { MateuSession } from './MateuSession.ts';

const errorText = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** What the session lets an agent's event do. `close` hides the assistant (a phone's sheet would
 *  cover where the user was sent); it stays mounted, so the conversation goes on. */
export function uiEventHooks(session: MateuSession, close: () => void): ChatEventHooks {
  return {
    dispatch: (event, detail) => session.dispatchEvent(event, detail),
    navigate: (nav) => {
      session.navigateTo(nav);
      close();
    },
    close,
    renderScreen: (req) => {
      const route = session.currentScreen()?.route ?? '';
      session.api
        .runAction({ ...previewActionOf(req, route), appState: session.appState })
        .then((increment) => session.showPreview(increment, req.target, req.title))
        .catch((e) => session.notify(null, errorText(e), 'error'));
      close();
    },
  };
}

/** Applies one agent UI event on `session` (see the module comment). */
export function applyUiEvent(session: MateuSession, event: ChatUiEvent, close: () => void = () => session.closeAssistant()): ChatEventOutcome {
  return applyChatEvent(event, uiEventHooks(session, close));
}
