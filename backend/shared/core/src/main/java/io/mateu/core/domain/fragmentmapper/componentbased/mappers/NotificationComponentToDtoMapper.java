package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.NotificationDto;
import io.mateu.uidl.data.Notification;
import java.util.List;

public class NotificationComponentToDtoMapper {

  public static ComponentDto mapNotificationToDto(Notification notification) {
    return new ComponentDto(
        new NotificationDto(notification.title(), notification.text()), "fieldId", null, List.of());
  }
}
