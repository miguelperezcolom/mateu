package io.mateu.uidl.data;

import lombok.Builder;

/**
 * One entry of a {@link MessageList}: markdown-capable text, the author name and (optional) a
 * timestamp, avatar image, avatar abbreviation and a colour index (0-6) for the generated avatar.
 */
@Builder
public record MessageListItem(
    String text,
    String userName,
    String time,
    String userImg,
    String userAbbr,
    Integer userColorIndex) {

  public MessageListItem(String text, String userName) {
    this(text, userName, null, null, null, null);
  }
}
