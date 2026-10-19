package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A collapsible block with a summary that expands to reveal its content. */
@Builder
public record Details(
    Component summary, Component content, String style, String cssClasses, boolean opened)
    implements Component {}
