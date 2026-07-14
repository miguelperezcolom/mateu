package io.mateu.dtos;

import java.util.Collections;
import java.util.List;
import lombok.Builder;

@Builder
public record CommentThreadDto(List<CommentDto> comments) implements ComponentMetadataDto {

  public CommentThreadDto {
    comments = Collections.unmodifiableList(comments != null ? comments : Collections.emptyList());
  }

  @Override
  public List<CommentDto> comments() {
    return Collections.unmodifiableList(comments);
  }
}
