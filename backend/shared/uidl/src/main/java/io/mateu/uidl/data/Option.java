package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * A selectable option. {@code children} makes it a NODE of a hierarchical option set (tree selects,
 * see {@code @TreeSelect}); flat option lists simply leave it empty.
 */
@Builder
public record Option(
    Object value,
    String label,
    String description,
    String image,
    String imageStyle,
    String icon,
    List<Option> children) {

  public Option {
    children = children != null ? children : List.of();
  }

  public Option(Object value) {
    this(value, "" + value, "", "", "", "", List.of());
  }

  public Option(Object value, String label) {
    this(value, label, "", "", "", "", List.of());
  }

  public Option(Object value, String label, String description) {
    this(value, label, description, "", "", "", List.of());
  }

  public Option(Object value, String label, String description, String image) {
    this(value, label, description, image, "", "", List.of());
  }

  public Option(
      Object value,
      String label,
      String description,
      String image,
      String imageStyle,
      String icon) {
    this(value, label, description, image, imageStyle, icon, List.of());
  }

  /** A tree node: an option with children. */
  public Option(Object value, String label, List<Option> children) {
    this(value, label, "", "", "", "", children);
  }
}
