package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/**
 * A selectable option on the wire. {@code children} carries the sub-options of a hierarchical
 * option set (tree selects); flat lists leave it empty.
 */
public record OptionDto(
    Object value,
    String label,
    String description,
    String image,
    String imageStyle,
    String icon,
    List<OptionDto> children) {

  public OptionDto {
    children = Collections.unmodifiableList(children != null ? children : List.of());
  }

  public OptionDto(
      Object value,
      String label,
      String description,
      String image,
      String imageStyle,
      String icon) {
    this(value, label, description, image, imageStyle, icon, List.of());
  }
}
