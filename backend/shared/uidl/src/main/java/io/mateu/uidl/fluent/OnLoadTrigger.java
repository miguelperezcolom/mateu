package io.mateu.uidl.fluent;

import lombok.Builder;

/**
 * Runs {@code actionId} when the component loads. {@code background = true} runs it as a silent
 * refresh — no loading veil, no busy affordance — which is what a status poll wants: a detail that
 * re-fetches itself every couple of seconds should update in place, not dim the whole page on every
 * tick. Default false keeps the veil for a first-load fetch that genuinely replaces the screen.
 */
@Builder
public record OnLoadTrigger(
    String actionId, int timeoutMillis, int times, String condition, boolean background)
    implements Trigger {

  public OnLoadTrigger(String actionId) {
    this(actionId, 0, 1, null, false);
  }

  public OnLoadTrigger(String actionId, int timeoutMillis, int times, String condition) {
    this(actionId, timeoutMillis, times, condition, false);
  }
}
