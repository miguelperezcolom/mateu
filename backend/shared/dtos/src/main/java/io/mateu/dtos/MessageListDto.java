package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

/** Read-only chat-style message list. */
public record MessageListDto(List<MessageListItemDto> items) implements ComponentMetadataDto {

  public MessageListDto {
    items = Collections.unmodifiableList(items != null ? items : Collections.emptyList());
  }

  @Override
  public List<MessageListItemDto> items() {
    return Collections.unmodifiableList(items);
  }
}
