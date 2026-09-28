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
   * The Oracle Redwood "Guided Process". In the Redwood renderer it is the {@code
   * oj-sp-guided-process} page template itself: the process opens on its overview — the title and
   * {@code @Subtitle} over the steps as tall columns side by side (01, 02, …), each marked completed
   * once done — and Start opens the steps one at a time, with the step list on the right. In
   * Vaadin it is a lateral progress rail: the step form on the left and a sticky right-hand band
   * showing a big {@code current | total} counter over the vertical list of steps with done-checks
   * and the current step highlighted.
   */
  RAIL
}
