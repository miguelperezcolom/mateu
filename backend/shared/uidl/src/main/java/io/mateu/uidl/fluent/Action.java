package io.mateu.uidl.fluent;

public record Action(
    String id,
    String icon,
    String label,
    ActionType type,
    ActionStereotype stereotype,
    ActionThemeVariant[] variants,
    boolean visible,
    boolean validationRequired,
    boolean confirmationRequired,
    boolean rowsSelectedRequired,
    ConfirmationTexts confirmationTexts,
    ActionTarget target,
    String modalStyle,
    String modalTitle,
    String customEvent,
    String href,
    boolean runOnEnter,
    ActionPosition position,
    int timeoutMillis,
    int times,
    int order) {}
