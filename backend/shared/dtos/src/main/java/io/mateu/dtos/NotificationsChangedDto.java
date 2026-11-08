package io.mateu.dtos;

/**
 * The data of a {@code NotificationsChanged} command (live updates): an entry added or changed
 * ({@code notification}), one removed ({@code removedId}), or — both null — "fetch the list again".
 */
public record NotificationsChangedDto(AppNotificationDto notification, String removedId) {}
