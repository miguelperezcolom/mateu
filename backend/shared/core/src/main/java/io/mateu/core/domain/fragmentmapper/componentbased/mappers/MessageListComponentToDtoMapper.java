package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MessageListDto;
import io.mateu.uidl.data.MessageList;
import java.util.List;

public class MessageListComponentToDtoMapper {

  public static ClientSideComponentDto mapMessageListToDto(MessageList messageList) {
    return new ClientSideComponentDto(new MessageListDto(), "fieldId", List.of());
  }
}
