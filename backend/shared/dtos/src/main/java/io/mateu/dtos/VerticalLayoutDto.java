package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/** Metadata for a vertical layout. Child componentIds are in the VerticalLayout component itself */
@Builder
public record VerticalLayoutDto(
    boolean spacing,
    boolean padding,
    boolean margin,
    SpacingVariantDto spacingVariant,
    HorizontalAlignmentDto horizontalAlignment,
    JustificationDto justification,
    boolean wrap,
    List<Integer> flexGrows,
    boolean fullWidth,
    String style)
    implements ComponentMetadataDto {}
