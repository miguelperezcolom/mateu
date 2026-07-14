package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/**
 * A read-only discussion thread: a list of {@link Comment}s, each with an author, text, timestamp
 * and nested {@code replies}. Design-system neutral, dark-mode aware.
 */
@Builder
public record CommentThread(String id, List<Comment> comments, String style, String cssClasses)
    implements Component {}
