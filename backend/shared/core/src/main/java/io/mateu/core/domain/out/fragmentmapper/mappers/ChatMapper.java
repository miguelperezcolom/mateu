package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ChatDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.uidl.data.Chat;
import java.util.List;

public class ChatMapper {

  public static ClientSideComponentDto mapChatToDto(Chat chat) {
    return new ClientSideComponentDto(
        new ChatDto(chat.sseUrl(), chat.uploadUrl()),
        "fieldId",
        List.of(),
        chat.style(),
        chat.cssClasses(),
        null);
  }
}
