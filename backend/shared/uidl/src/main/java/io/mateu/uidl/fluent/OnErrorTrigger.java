package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record OnErrorTrigger(String actionId, String calledActionId, String condition)
    implements Trigger {}
