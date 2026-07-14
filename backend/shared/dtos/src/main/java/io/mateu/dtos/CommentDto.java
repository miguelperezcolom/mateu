package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record CommentDto(
    String id,
    String author,
    String avatar,
    String text,
    String timestamp,
    List<CommentDto> replies) {

  public CommentDto {
    replies = Collections.unmodifiableList(replies != null ? replies : Collections.emptyList());
  }

  @Override
  public List<CommentDto> replies() {
    return Collections.unmodifiableList(replies);
  }
}
