package io.mateu.dtos;

/** One entry of a {@link MessageListDto}. */
public record MessageListItemDto(
    String text,
    String userName,
    String time,
    String userImg,
    String userAbbr,
    Integer userColorIndex) {}
