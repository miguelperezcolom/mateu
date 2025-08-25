package io.mateu.core.domain.messagemapper;

import io.mateu.dtos.MessageDto;
import io.mateu.dtos.NotificationPositionDto;
import io.mateu.dtos.NotificationVariantDto;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.Collection;
import java.util.List;

public class MessageMapper {

  public static List<MessageDto> mapToMessageDtos(
      Object instance, String baseUrl, HttpRequest httpRequest) {
    if (instance instanceof Message message) {
      return List.of(mapMessage(message));
    }
    if (instance instanceof Collection<?> collection) {
      return collection.stream()
          .filter(o -> o instanceof Message)
          .map(message -> mapMessage((Message) message))
          .toList();
    }
    return List.of();
  }

  private static MessageDto mapMessage(Message message) {
    return MessageDto.builder()
        .variant(
            message.variant() != null
                ? NotificationVariantDto.valueOf(message.variant().name())
                : null)
        .position(
            message.position() != null
                ? NotificationPositionDto.valueOf(message.position().name())
                : null)
        .title(message.title())
        .text(message.text())
        .duration(message.duration() > 0 ? message.duration() : 3000)
        .build();
  }
}
