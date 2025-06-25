package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MessageListDto;
import io.mateu.uidl.data.MessageList;
import java.util.List;

public class MessageListComponentToDtoMapper {

  public static ComponentDto mapMessageListToDto(MessageList messageList) {
    return new ComponentDto(new MessageListDto(), "fieldId", null, List.of());
  }
}
