package io.mateu.dtos;

import java.util.List;
import lombok.Builder;

/**
 * One entry of the notification inbox, as pushed by {@code NotificationsChanged}.
 *
 * @param id identifies the entry (and deduplicates it: the same id replaces the entry)
 * @param category groups entries (by source or type)
 * @param resolved acted upon (approved, done…) — kept in the list, shown under "resolved"
 * @param actions what can be done from the entry (run server-side with {@code _notifications-act})
 * @param hasDetail clicking it asks the server for its detail ({@code _notifications-open})
 */
@Builder
public record AppNotificationDto(
    String id,
    String title,
    String text,
    String route,
    boolean unread,
    String when,
    String category,
    NotificationVariantDto variant,
    boolean resolved,
    List<MessageActionDto> actions,
    boolean hasDetail) {}
