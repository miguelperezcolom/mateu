package io.mateu.uidl.interfaces;

import io.mateu.uidl.annotations.Experimental;

/**
 * A wizard that can be saved half-way and resumed later (the Redwood guided-process {@code
 * saveDraft}/{@code saveAndClose}/{@code resumeStepId} trio). Implementing it adds a "Save" and a
 * "Save and close" button to every step (each switchable through {@code WizardDisplay}).
 *
 * <ul>
 *   <li>{@link #saveDraft} persists whatever has been captured so far — the current step is
 *       hydrated first but NOT validated: a draft is allowed to be incomplete. Its return value is
 *       the response (null → a "Draft saved" notification and the wizard stays on the step).
 *   <li>{@link #closeDraft} decides where "Save and close" goes after saving: a route ({@code URI}
 *       or {@code String}) navigates there; null, the default, lands on {@code "/"}; a {@code
 *       Message} is shown instead of the "Draft saved" notification (then the default landing); a
 *       {@code UICommand} or anything else (a fragment, a component) is applied as the answer.
 *   <li>{@link #resumeStep} names the step field to open on when the wizard is loaded — the step
 *       the user left — or null to start at the beginning.
 * </ul>
 */
@Experimental("wizard drafts (3.0-alpha.409)")
public interface Draftable {

  Object saveDraft(HttpRequest httpRequest);

  /**
   * Where "Save and close" lands after saving: a route ({@code URI} / {@code String}) navigates
   * there, null lands on {@code "/"}, a {@code Message} replaces the "Draft saved" notification
   * (and the default landing applies), a {@code UICommand} or any other answer is applied as such.
   */
  default Object closeDraft(HttpRequest httpRequest) {
    return null;
  }

  /** The step field name to resume on when the wizard opens, or null for the first step. */
  default String resumeStep(HttpRequest httpRequest) {
    return null;
  }
}
