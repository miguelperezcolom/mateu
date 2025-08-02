package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record HorizontalLayoutDto(
    boolean spacing,
    boolean padding,
    boolean margin,
    SpacingVariantDto spacingVariant,
    VerticalAlignmentDto verticalAlignment,
    JustificationDto justification,
    boolean wrap,
    List<Integer> flexGrows,
    boolean fullWidth,
    String style)
    implements ComponentMetadataDto {}
