package io.mateu.dtos;

public record Action(
    String id,
    String caption,
    ActionType type,
    boolean visible,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTexts confirmationTexts,
    ActionTarget target,
    String modalStyle,
    String customEvent,
    String href) {}
