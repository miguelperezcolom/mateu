package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record OnValueChangeTrigger(String actionId, String propertyName, String condition)
    implements Trigger {}
