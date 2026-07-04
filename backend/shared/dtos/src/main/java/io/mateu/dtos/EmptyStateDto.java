package io.mateu.dtos;

import lombok.Builder;

/** Friendly empty-state placeholder */
@Builder
public record EmptyStateDto(
    String icon, String title, String description, String actionId, String actionLabel)
    implements ComponentMetadataDto {}
