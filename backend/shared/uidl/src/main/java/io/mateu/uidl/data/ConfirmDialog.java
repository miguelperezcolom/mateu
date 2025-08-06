package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record ConfirmDialog(
    String header,
    Component content,
    boolean canCancel,
    boolean canReject,
    String rejectText,
    String confirmText,
    String openedCondition,
    String confirmActionId,
    String rejectActionId,
    String cancelActionId,
    String style,
    String cssClasses)
    implements Component {}
