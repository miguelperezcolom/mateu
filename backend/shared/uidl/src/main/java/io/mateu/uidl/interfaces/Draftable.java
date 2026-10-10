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
 *   <li>{@link #closeDraft} decides where "Save and close" goes after saving (null, the default →
 *       back in browser history).
 *   <li>{@link #resumeStep} names the step field to open on when the wizard is loaded — the step
 *       the user left — or null to start at the beginning.
 * </ul>
 */
@Experimental("wizard drafts (3.0-alpha.409)")
public interface Draftable {

  Object saveDraft(HttpRequest httpRequest);

  /** Where "Save and close" lands after saving; null = go back in history. */
  default Object closeDraft(HttpRequest httpRequest) {
    return null;
  }

  /** The step field name to resume on when the wizard opens, or null for the first step. */
  default String resumeStep(HttpRequest httpRequest) {
    return null;
  }
}
