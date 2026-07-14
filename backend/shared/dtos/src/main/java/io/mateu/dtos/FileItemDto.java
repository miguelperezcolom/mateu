package io.mateu.dtos;

import lombok.Builder;

@Builder
public record FileItemDto(String name, String size, String type, String url, String actionId) {}
