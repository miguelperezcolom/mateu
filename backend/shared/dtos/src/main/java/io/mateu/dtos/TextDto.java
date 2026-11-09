package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import java.util.Map;

/**
 * Metadata for a html element. {@code variants} are the text's emphasis — {@code b} (bold), {@code
 * i} (italic) — absent when it has none.
 */
public record TextDto(
    TextContainerDto container,
    Map<String, String> attributes,
    String text,
    String size,
    boolean noMargins,
    List<String> variants)
    implements ComponentMetadataDto {

  public TextDto(
      TextContainerDto container,
      Map<String, String> attributes,
      String text,
      String size,
      boolean noMargins) {
    this(container, attributes, text, size, noMargins, null);
  }

  public TextDto(TextContainerDto container, Map<String, String> attributes, String text) {
    this(container, attributes, text, null, false, null);
  }

  public TextDto {
    attributes = attributes != null ? Collections.unmodifiableMap(attributes) : Map.of();
    variants = variants == null || variants.isEmpty() ? null : List.copyOf(variants);
  }

  @Override
  public Map<String, String> attributes() {
    return Collections.unmodifiableMap(attributes);
  }
}
