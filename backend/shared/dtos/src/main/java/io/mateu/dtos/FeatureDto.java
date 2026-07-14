package io.mateu.dtos;

import lombok.Builder;

@Builder
public record FeatureDto(String icon, String title, String description, String actionId) {}
