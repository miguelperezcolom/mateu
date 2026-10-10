package io.mateu.uidl.data;

/**
 * The tri-state switch of an affordance an archetype brings built in (the Oracle Redwood {@code
 * displayOptions} grammar): {@code on} — shown and usable; {@code off} — not shown; {@code
 * disabled} — shown but inert (the "you can see it, you cannot use it" state permissions need).
 *
 * <p>Each archetype groups its toggles in its own display record ({@code WizardDisplay}, {@code
 * CrudDisplay}, {@code GeneralOverviewDisplay}) returned by an overridable {@code display()} method
 * — one place and one shape per template, instead of a mix of booleans and annotations. Toggles are
 * consumed server-side while composing: a {@code disabled} affordance travels as a disabled button,
 * an {@code off} one does not travel at all, so no renderer needs to know about them.
 */
public enum Toggle {
  on,
  off,
  disabled;

  /** Whether the affordance is drawn at all ({@code on} or {@code disabled}). */
  public boolean shown() {
    return this != off;
  }

  /** Whether the affordance can be used ({@code on} only). */
  public boolean enabled() {
    return this == on;
  }

  /** {@code null} reads as the given default, so a display record can leave toggles unset. */
  public static Toggle or(Toggle toggle, Toggle fallback) {
    return toggle != null ? toggle : fallback;
  }
}
