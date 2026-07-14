package io.mateu.uidl.data;

import java.util.List;
import lombok.Builder;

/**
 * One entry of a {@link CommentThread}: an {@code author} with {@code avatar} (emoji or image URL),
 * the comment {@code text}, a {@code timestamp} label, and nested {@code replies}.
 */
@Builder
public record Comment(
    String id,
    String author,
    String avatar,
    String text,
    String timestamp,
    List<Comment> replies) {}
