package io.mateu.dtos;

/** Metadata for a html element */
public record PopoverDto(ComponentDto content, ComponentDto wrapped, String trigger)
    implements ComponentMetadataDto {

  public PopoverDto(ComponentDto content, ComponentDto wrapped) {
    this(content, wrapped, "click");
  }
}
