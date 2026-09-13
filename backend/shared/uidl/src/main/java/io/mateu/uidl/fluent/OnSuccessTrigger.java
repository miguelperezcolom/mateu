package io.mateu.uidl.fluent;

import lombok.Builder;

/**
 * After {@code calledActionId} succeeds, runs {@code actionId} (optionally after {@code
 * timeoutMillis}). {@code background = true} runs it as a silent refresh (no loading veil) — what a
 * self-re-scheduling poll wants: {@code refresh} → wait → {@code refresh} → … must not dim the page
 * on every tick. Default false preserves the veil.
 */
@Builder
public record OnSuccessTrigger(
    String actionId, String calledActionId, String condition, int timeoutMillis, boolean background)
    implements Trigger {

  public OnSuccessTrigger(String actionId, String calledActionId) {
    this(actionId, calledActionId, "", 0, false);
  }

  public OnSuccessTrigger(String actionId, String calledActionId, String condition) {
    this(actionId, calledActionId, condition, 0, false);
  }

  public OnSuccessTrigger(
      String actionId, String calledActionId, String condition, int timeoutMillis) {
    this(actionId, calledActionId, condition, timeoutMillis, false);
  }
}
