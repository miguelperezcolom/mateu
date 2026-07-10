package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MessageInputDto;
import io.mateu.uidl.data.MessageInput;
import java.util.List;

public class MessageInputMapper {

  public static ClientSideComponentDto mapMessageInputToDto(MessageInput messageInput) {
    return new ClientSideComponentDto(
        new MessageInputDto(messageInput.actionId()),
        messageInput.id() != null ? messageInput.id() : "messageInput",
        List.of(),
        messageInput.style(),
        messageInput.cssClasses(),
        null);
  }
}
