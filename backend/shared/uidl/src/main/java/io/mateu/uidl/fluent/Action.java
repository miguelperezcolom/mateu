package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record Action(
    String id,
    boolean foreground,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTexts confirmationTexts,
    ActionTarget target,
    String modalStyle,
    String modalTitle,
    String customEvent,
    String href) {}
