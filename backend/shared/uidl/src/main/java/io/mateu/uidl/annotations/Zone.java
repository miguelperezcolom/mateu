package io.mateu.uidl.annotations;

/**
 * Declares one named layout zone (a column) of a zoned form. Used inside {@link Zones}. Sections
 * whose {@link Section#zone()} matches {@link #name()} are stacked, in declaration order, inside
 * this zone.
 */
public @interface Zone {

  /** Zone name, referenced by {@link Section#zone()}. */
  String name();

  /**
   * CSS width of the zone column, e.g. {@code "64%"} or {@code "30rem"}. Empty means the zone grows
   * to fill the remaining space ({@code flex: 1}).
   */
  String width() default "";
}
