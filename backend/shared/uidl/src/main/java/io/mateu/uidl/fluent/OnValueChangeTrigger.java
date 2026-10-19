package io.mateu.uidl.fluent;

import lombok.Builder;

/** Runs an action when a field value changes, optionally only if a condition holds. */
@Builder
public record OnValueChangeTrigger(String actionId, String propertyName, String condition)
    implements Trigger {}
