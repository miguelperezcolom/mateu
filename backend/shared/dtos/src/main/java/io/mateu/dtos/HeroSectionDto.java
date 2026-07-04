package io.mateu.dtos;

import lombok.Builder;

/** Page hero header. Slotted content travels as component children */
@Builder
public record HeroSectionDto(
    String title, String subtitle, String image, String height, boolean centered)
    implements ComponentMetadataDto {}
