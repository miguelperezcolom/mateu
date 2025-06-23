package io.mateu.core.domain.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.MessageInputDto;
import io.mateu.uidl.data.MessageInput;
import java.util.List;

public class MessageInputComponentToDtoMapper {

  public static ComponentDto mapMessageInputToDto(MessageInput messageInput) {
    return new ComponentDto(new MessageInputDto(), "fieldId", null, List.of());
  }
}
