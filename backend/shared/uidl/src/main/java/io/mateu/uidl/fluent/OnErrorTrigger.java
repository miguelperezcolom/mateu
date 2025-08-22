package io.mateu.uidl.fluent;

public record OnErrorTrigger(String actionId, String calledActionId, String condition)
    implements Trigger {}
