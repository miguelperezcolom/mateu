package io.mateu.dtos;

import java.util.Map;

/** Metadata for a html element */
public record ElementDto(
    String name,
    Map<String, String> attributes,
    Map<String, String> on,
    String content,
    boolean html)
    implements ComponentMetadataDto {

  /** Backward-compatible constructor: escaped text content (html = false). */
  public ElementDto(
      String name, Map<String, String> attributes, Map<String, String> on, String content) {
    this(name, attributes, on, content, false);
  }
}
