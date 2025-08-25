package io.mateu.dtos;

import lombok.Builder;

/**
 * A message to be shown to the user
 *
 * @param title The message title
 * @param text The message text
 */
@Builder
public record MessageDto(
    NotificationVariantDto variant,
    NotificationPositionDto position,
    String title,
    String text,
    int duration) {}
