package io.mateu.uidl.data;

import lombok.Builder;

@Builder
public record Rule(
    String filter,
    RuleAction action,
    String fieldName,
    RuleFieldAttribute fieldAttribute,
    Object value,
    String expression,
    RuleResult result) {}
