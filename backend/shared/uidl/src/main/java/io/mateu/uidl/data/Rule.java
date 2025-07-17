package io.mateu.uidl.data;

public record Rule(String filter, RuleAction action, Object data, RuleResult result) {}
