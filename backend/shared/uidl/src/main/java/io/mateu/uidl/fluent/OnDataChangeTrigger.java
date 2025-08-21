package io.mateu.uidl.fluent;

public record OnDataChangeTrigger(String actionId, String propertyName, String condition)
    implements Trigger {}
