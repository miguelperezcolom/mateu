package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a vertical layout. Child componentIds are in the VerticalLayout component itself */
@Builder
public record VerticalLayoutDto() implements ComponentMetadataDto {}
