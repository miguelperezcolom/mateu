package io.mateu.dtos;

import lombok.Builder;

@Builder
public record FabDto(String id, String label, String icon, String actionId, String buttonStyle) {}
