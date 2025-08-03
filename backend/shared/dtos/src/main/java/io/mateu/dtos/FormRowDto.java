package io.mateu.dtos;

import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record FormRowDto() implements ComponentMetadataDto {}
