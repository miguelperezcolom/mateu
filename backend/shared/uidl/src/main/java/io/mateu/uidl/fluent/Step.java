package io.mateu.uidl.fluent;

import io.mateu.uidl.data.UICommand;

/**
 * A single step of an action's flow — the coherence-plan behavior model (`design/coherence-plan.md`
 * idea #3), v0.
 *
 * <p>An action is <em>a confirmable sequence of steps</em>, and a step is rule-shaped (if / then /
 * data / result). This v0 captures the <b>command-effect</b> verbs — the ones that map 1:1 to an
 * existing {@link UICommand} — so a flow built from them runs on the CURRENT wire with no renderer
 * change. The vocabulary is meant to GROW as demand pulls it (set / validate / callRest / branch /
 * forEach…); {@code runJs} stays a web/RN-only escape hatch, never portable. Bounded on purpose:
 * not a programming language, so it stays analyzable and implementable in every interpreter.
 *
 * <p>Because each v0 verb is exactly one {@link UICommand}, the whole model is additive: nothing
 * that exists today changes, and a step can be lowered to the wire the frontend already understands
 * via {@link #toCommand()}.
 */
public sealed interface Step
    permits Step.Navigate,
        Step.Emit,
        Step.CloseOverlay,
        Step.RunAction,
        Step.MarkClean,
        Step.MarkDirty {

  /**
   * Lowers this step to the wire command it produces (v0: every verb is one existing UICommand).
   */
  UICommand toCommand();

  /** Navigate to a route. */
  record Navigate(String route) implements Step {
    @Override
    public UICommand toCommand() {
      return UICommand.navigateTo(route);
    }
  }

  /**
   * Emit a named event on the app event bus (pub/sub — refinement R1), optionally with a payload.
   */
  record Emit(String event, Object payload) implements Step {
    public Emit(String event) {
      this(event, null);
    }

    @Override
    public UICommand toCommand() {
      return payload == null
          ? UICommand.dispatchEvent(event)
          : UICommand.dispatchEvent(event, payload);
    }
  }

  /**
   * Close the top overlay (dialog/drawer), optionally emitting a named result event as it closes.
   */
  record CloseOverlay(String event) implements Step {
    public CloseOverlay() {
      this(null);
    }

    @Override
    public UICommand toCommand() {
      return event == null ? UICommand.closeModal() : UICommand.closeModal(event);
    }
  }

  /** Run a server action by id (the "call the server" verb — needs a backend). */
  record RunAction(String actionId) implements Step {
    @Override
    public UICommand toCommand() {
      return UICommand.runAction(actionId);
    }
  }

  /** Mark the current view clean (e.g. after a save) — suppresses the unsaved-changes guard. */
  record MarkClean() implements Step {
    @Override
    public UICommand toCommand() {
      return UICommand.markAsClean();
    }
  }

  /** Mark the current view dirty — arms the unsaved-changes navigation guard. */
  record MarkDirty() implements Step {
    @Override
    public UICommand toCommand() {
      return UICommand.markAsDirty();
    }
  }
}
