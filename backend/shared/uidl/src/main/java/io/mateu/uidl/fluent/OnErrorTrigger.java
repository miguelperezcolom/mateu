package io.mateu.uidl.fluent;

import lombok.Builder;

/** Runs an action when another action fails. */
@Builder
public record OnErrorTrigger(String actionId, String calledActionId, String condition)
    implements Trigger {}
