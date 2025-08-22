package io.mateu.uidl.fluent;

public record OnValueChangeTrigger(String actionId, String propertyName, String condition)
    implements Trigger {}
