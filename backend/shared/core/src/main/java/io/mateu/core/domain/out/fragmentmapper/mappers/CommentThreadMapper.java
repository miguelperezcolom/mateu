package io.mateu.core.domain.out.fragmentmapper.mappers;

import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.CommentDto;
import io.mateu.dtos.CommentThreadDto;
import io.mateu.uidl.data.Comment;
import io.mateu.uidl.data.CommentThread;
import java.util.List;

public class CommentThreadMapper {

  public static ClientSideComponentDto mapCommentThreadToDto(CommentThread thread) {
    return new ClientSideComponentDto(
        CommentThreadDto.builder()
            .comments(
                thread.comments() != null
                    ? thread.comments().stream().map(CommentThreadMapper::mapComment).toList()
                    : List.of())
            .build(),
        thread.id(),
        List.of(),
        thread.style(),
        thread.cssClasses(),
        null);
  }

  private static CommentDto mapComment(Comment comment) {
    return CommentDto.builder()
        .id(comment.id())
        .author(comment.author())
        .avatar(comment.avatar())
        .text(comment.text())
        .timestamp(comment.timestamp())
        .replies(
            comment.replies() != null
                ? comment.replies().stream().map(CommentThreadMapper::mapComment).toList()
                : List.of())
        .build();
  }
}
