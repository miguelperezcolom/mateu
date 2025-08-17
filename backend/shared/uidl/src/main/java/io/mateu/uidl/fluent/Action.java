package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record Action(
    String id,
    boolean background,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTexts confirmationTexts,
    String modalStyle,
    String modalTitle,
    String customEvent,
    String href,
    String js) {}
