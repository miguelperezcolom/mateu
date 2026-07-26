package io.mateu.dtos;

import lombok.Builder;

/**
 * Redwood-style content page layout. The regions travel as slotted children: the primary region as
 * {@code main-N}, the contextual secondary region as {@code aside-N}, and the full-width footer as
 * {@code footer-N} (each matching the source list order).
 */
@Builder
public record ContentLayoutDto(String asidePosition, String asideWidth, boolean asideSticky)
    implements ComponentMetadataDto {}
