package io.mateu.dtos;

/**
 * An image a page template shows in its own place and size; {@code initials} for an avatar, {@code
 * alt} the text a screen reader reads for it (the declared one, else the page's title).
 */
public record TemplateImageDto(String src, String initials, String alt) {

  public TemplateImageDto(String src, String initials) {
    this(src, initials, null);
  }
}
