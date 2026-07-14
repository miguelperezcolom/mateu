package io.mateu.dtos;

import lombok.Builder;

@Builder
public record CalloutCardDto(
    String title, String description, String icon, String ctaLabel, String actionId, String theme)
    implements ComponentMetadataDto {}
