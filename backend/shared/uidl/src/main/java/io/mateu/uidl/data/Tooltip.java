package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** Wraps a component and shows explanatory text when the user hovers or focuses it. */
@Builder
public record Tooltip(String text, Component wrapped, String style, String cssClasses)
    implements Component {}
