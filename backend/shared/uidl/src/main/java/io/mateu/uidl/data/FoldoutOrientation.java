package io.mateu.uidl.data;

/**
 * Orientation of a {@link FoldoutLayout}'s Page Overview, per the Oracle RDS Foldout Layout Page
 * Template spec. The two configurations are alternatives, not combined:
 *
 * <ul>
 *   <li>{@link #vertical} — the overview sits on the LEFT, pinned; panels are laid out to its
 *       right.
 *   <li>{@link #horizontal} — the overview spans the TOP, full width; panels are laid out in a row
 *       below it.
 * </ul>
 */
public enum FoldoutOrientation {
  vertical,
  horizontal
}
