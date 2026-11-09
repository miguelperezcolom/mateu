package io.mateu.dtos;

import lombok.Builder;

/**
 * Metadata for a master/detail layout: the master is its first child, the detail its second. {@code
 * orientation} vertical puts the detail BELOW the master; absent = beside it.
 */
@Builder
public record MasterDetailLayoutDto(OrientationDto orientation) implements ComponentMetadataDto {}
