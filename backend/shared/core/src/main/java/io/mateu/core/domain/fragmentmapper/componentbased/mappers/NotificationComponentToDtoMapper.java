package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.NotificationDto;
import io.mateu.uidl.data.Notification;
import java.util.List;

public class NotificationComponentToDtoMapper {

  public static ClientSideComponentDto mapNotificationToDto(Notification notification) {
    return new ClientSideComponentDto(
        new NotificationDto(notification.title(), notification.text()), "fieldId", List.of());
  }
}
