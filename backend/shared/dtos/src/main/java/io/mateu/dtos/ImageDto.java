package io.mateu.dtos;

/**
 * Metadata for an image.
 *
 * @param src the url or data URI
 * @param alt its text alternative for assistive technology; null = none declared
 */
public record ImageDto(String src, String alt) implements ComponentMetadataDto {

  /** An image with no declared text alternative. */
  public ImageDto(String src) {
    this(src, null);
  }
}
