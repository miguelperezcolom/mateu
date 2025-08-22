package io.mateu.uidl.fluent;

public record OnSuccessTrigger(String actionId, String calledActionId, String condition)
    implements Trigger {}
