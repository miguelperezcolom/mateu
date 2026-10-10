package io.mateu.dtos;

import java.util.Map;
import lombok.Builder;

@Builder
public record ActionPanelItemDto(
    String label,
    String actionId,
    Map<String, Object> parameters,
    Integer count,
    boolean populated,
    boolean disabled) {}
