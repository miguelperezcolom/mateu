package io.mateu.uidl.annotations;

/**
 * Where a form's field labels sit. Selected with {@link FormLayout#labelsAside()}.
 *
 * <p>With {@link #AUTO} (the default) Mateu infers the mode from the form's shape (see {@code
 * LabelsAsideInference}): labels-aside only pays off for dense single-column forms of
 * short-labelled, single-line widgets; anything else keeps labels on top.
 */
public enum LabelsAsideMode {

  /** Infer from the form's shape (default). */
  AUTO,

  /** Force labels aside (to the left of the field) — the dense backoffice data-entry idiom. */
  ASIDE,

  /** Force labels on top of the field. */
  TOP
}
