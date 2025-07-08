package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record BoardLayout(String id, List<BoardLayoutRow> rows, String style, String cssClasses)
    implements Component {}
