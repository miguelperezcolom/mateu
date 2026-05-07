package io.mateu.core.domain.out.fragmentmapper.componentbased.mappers;

import io.mateu.dtos.AvatarDto;
import io.mateu.dtos.ChatDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Chat;

import java.util.List;

public class ChatComponentToDtoMapper {

  public static ClientSideComponentDto mapChatToDto(Chat chat) {
    return new ClientSideComponentDto(
        new ChatDto(chat.sseUrl()),
        "fieldId",
        List.of(),
        chat.style(),
        chat.cssClasses(),
        null);
  }
}
