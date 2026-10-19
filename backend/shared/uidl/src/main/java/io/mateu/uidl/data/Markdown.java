package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A block of text rendered from Markdown. */
@Builder
public record Markdown(String markdown, String style, String cssClasses) implements Component {}
