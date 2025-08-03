package io.mateu.dtos;

import lombok.Builder;

/**
 * Metadata for a horizontal layout. Child componentIds are in the HorizontalLayout component itself
 */
@Builder
public record FormLayoutDto(
    boolean autoResponsive,
    boolean labelsAside,
    int maxColumns,
    String columnWidth,
    boolean expandColumns,
    boolean expandFields,
    Object responsiveSteps,
    String itemLabelWidth,
    String columnSpacing,
    String itemRowSpacing,
    String itemLabelSpacing)
    implements ComponentMetadataDto {}
