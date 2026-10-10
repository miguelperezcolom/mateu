package io.mateu.dtos;

import lombok.Builder;

/** Page hero header. Slotted content travels as component children */
@Builder
public record HeroSectionDto(
    String title,
    String subtitle,
    String image,
    String height,
    boolean centered,
    /**
     * The band's tone: {@code null} = default look; otherwise one of ocean, pine, lilac, teal,
     * rose, pebble, slate, plum, sienna — a dark tinted band with light ink, each renderer mapping
     * the hue onto its own palette.
     */
    String tone)
    implements ComponentMetadataDto {}
