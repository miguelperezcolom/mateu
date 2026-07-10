package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.MessageListDto;
import io.mateu.dtos.MessageListItemDto;
import io.mateu.uidl.data.MessageList;
import java.util.List;

public class MessageListMapper {

  public static ClientSideComponentDto mapMessageListToDto(MessageList messageList) {
    return new ClientSideComponentDto(
        new MessageListDto(
            messageList.items() != null
                ? messageList.items().stream()
                    .map(
                        item ->
                            new MessageListItemDto(
                                item.text(),
                                item.userName(),
                                item.time(),
                                item.userImg(),
                                item.userAbbr(),
                                item.userColorIndex()))
                    .toList()
                : List.of()),
        messageList.id() != null ? messageList.id() : "messageList",
        List.of(),
        messageList.style(),
        messageList.cssClasses(),
        null);
  }
}
