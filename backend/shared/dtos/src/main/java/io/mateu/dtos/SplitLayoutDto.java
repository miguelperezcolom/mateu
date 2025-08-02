package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a split layout. Child componentIds are in the SplitLayout component itself */
@Builder
public record SplitLayoutDto(
    SplitLayoutOrientationDto orientation, SplitLayoutVariantDto variant, boolean fullWidth)
    implements ComponentMetadataDto {}
