package io.mateu.uidl.annotations;

/**
 * The sizing intent of a component (coherence-plan #8): how it should be sized within the space its
 * parent gives it.
 *
 * <ul>
 *   <li>{@link #hug} — size to content.
 *   <li>{@link #fill} — grow to fill the space the parent leaves, scrolling internally.
 *   <li>{@link #fixed} — a concrete size (see {@link Size#length()}).
 * </ul>
 *
 * <p>The same vocabulary is a grid track's size (#9): hug = {@code auto}, fixed = {@code px}, fill
 * = {@code fr}. One model seen two ways.
 */
public enum SizeMode {
  hug,
  fill,
  fixed
}
