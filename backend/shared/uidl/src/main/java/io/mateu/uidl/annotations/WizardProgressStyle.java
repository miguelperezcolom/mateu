package io.mateu.uidl.annotations;

/** How a {@code Wizard} visualizes its progress. Selected with {@link WizardProgress}. */
public enum WizardProgressStyle {

  /** A horizontal progress bar with the current step's label (default). */
  BAR,

  /**
   * Connected step bullets (the {@code ProgressSteps} component): one numbered dot per applicable
   * step joined by a line, with done/current/upcoming states — the classic, more recognizable
   * stepper.
   */
  STEPS,

  /**
   * A lateral progress rail (the Oracle Redwood "Guided Process" template): the step form on the
   * left and a sticky right-hand band showing a big {@code current | total} counter over the
   * vertical list of steps with done-checks and the current step highlighted.
   */
  RAIL
}
