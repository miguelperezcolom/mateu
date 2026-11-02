package io.mateu.dtos;

import lombok.Builder;

/**
 * An org chart on the wire: its {@code root}, the presentation ({@code tree} or {@code focus}; null
 * reads as {@code tree}) and the id of the node a focused chart opens on (null: the root).
 */
@Builder
public record OrgChartDto(OrgNodeDto root, String display, String focus)
    implements ComponentMetadataDto {}
