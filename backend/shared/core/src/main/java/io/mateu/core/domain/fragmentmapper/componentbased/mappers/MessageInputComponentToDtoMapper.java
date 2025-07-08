package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MessageInputDto;
import io.mateu.uidl.data.MessageInput;
import java.util.List;

public class MessageInputComponentToDtoMapper {

  public static ClientSideComponentDto mapMessageInputToDto(MessageInput messageInput) {
    return new ClientSideComponentDto(
        new MessageInputDto(),
        "fieldId",
        List.of(),
        messageInput.style(),
        messageInput.cssClasses());
  }
}
