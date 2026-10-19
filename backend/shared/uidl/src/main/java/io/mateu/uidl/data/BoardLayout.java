package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

/** A responsive dashboard board made of rows of items that share the row width in columns. */
@Builder
public record BoardLayout(String id, List<BoardLayoutRow> rows, String style, String cssClasses)
    implements Component {}
