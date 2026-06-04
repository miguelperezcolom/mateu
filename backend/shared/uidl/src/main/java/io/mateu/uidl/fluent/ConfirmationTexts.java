package io.mateu.uidl.fluent;

import lombok.Builder;

@Builder
public record ConfirmationTexts(
    String title, String message, String confirmationText, String denialText) {}
