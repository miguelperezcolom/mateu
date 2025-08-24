package io.mateu.uidl.data;

public record Rule(
        String filter,
        RuleAction action,
        String fieldName,
        FieldAttribute fieldAttribute,
        Object value,
        RuleResult result
) { }
