package io.mateu.uidl.annotations;

/**
 * How wide a section is when it is drawn as a panel beside others — a {@link FoldoutDetail}'s
 * foldout panels. {@code AUTO} sizes it by its content: narrow for a few short fields, medium for a
 * longer form, wide for a list, a table or a component.
 */
public enum PanelWidth {
  AUTO,
  NARROW,
  MEDIUM,
  WIDE
}
