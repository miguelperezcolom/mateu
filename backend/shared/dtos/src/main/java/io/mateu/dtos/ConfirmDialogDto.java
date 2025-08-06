package io.mateu.dtos;

import lombok.Builder;

/** Metadata for a html element */
@Builder
public record ConfirmDialogDto(
    String header,
    boolean canCancel,
    boolean canReject,
    String rejectText,
    String confirmText,
    String openedCondition,
    String confirmActionId,
    String rejectActionId,
    String cancelActionId)
    implements ComponentMetadataDto {}
