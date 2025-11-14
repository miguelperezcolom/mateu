package io.mateu.dtos;

import lombok.Builder;

@Builder
public record ConfirmationTextsDto(
    String title, String message, String confirmationText, String denialText) {}
