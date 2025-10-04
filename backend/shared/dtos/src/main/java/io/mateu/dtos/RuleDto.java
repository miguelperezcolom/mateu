package io.mateu.dtos;

import lombok.Builder;

@Builder
public record RuleDto(
    String filter,
    RuleActionDto action,
    String fieldName,
    RuleFieldAttributeDto fieldAttribute,
    Object value,
    String expression,
    RuleResultDto result,
    String actionId) {}
