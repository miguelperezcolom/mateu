package io.mateu.uidl.data;

import io.mateu.uidl.annotations.SizeMode;

/**
 * A track (column or row) of a {@link ResponsiveGrid} (coherence-plan #9). Its size IS the sizing
 * intent of #8: {@code hug} = {@code auto} (size to content), {@code fill} = {@code 1fr} (share the
 * free space), {@code fixed} = a concrete length. One model seen two ways — a component's sizing
 * and a grid track's size are the same vocabulary.
 */
public record GridTrack(SizeMode size, String length) {

  /** A track that sizes to its content ({@code auto}). */
  public static GridTrack hug() {
    return new GridTrack(SizeMode.hug, null);
  }

  /** A track that shares the free space ({@code 1fr}). */
  public static GridTrack fill() {
    return new GridTrack(SizeMode.fill, null);
  }

  /** A track of a concrete length (e.g. {@code "15rem"}). */
  public static GridTrack fixed(String length) {
    return new GridTrack(SizeMode.fixed, length);
  }

  /** This track as a CSS grid track size — {@code auto} | {@code 1fr} | the fixed length. */
  public String toCss() {
    return switch (size) {
      case hug -> "auto";
      case fill -> "1fr";
      case fixed -> length;
    };
  }
}
