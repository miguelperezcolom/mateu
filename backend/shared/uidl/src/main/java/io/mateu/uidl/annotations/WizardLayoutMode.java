package io.mateu.uidl.annotations;

/** How a {@code Wizard} is laid out. Selected with {@link WizardLayout}. */
public enum WizardLayoutMode {

  /** Classic wizard: only the current step is shown, one at a time (default). */
  STEPS,

  /**
   * Accumulative: the current step is shown editable, with a read-only recap of every completed
   * step stacked above it — so the user always sees what has been collected so far.
   */
  ACCUMULATIVE,

  /**
   * Accordion: every step is a collapsible panel. The current step is open; completed steps are
   * collapsed (but can be expanded to review their data); upcoming steps are disabled. As the user
   * advances, the previous panel collapses and the next opens.
   */
  ACCORDION
}
