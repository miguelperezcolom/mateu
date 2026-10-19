package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A scrollable viewport around a component whose content may overflow. */
@Builder
public record Scroller(Component content, String style, String cssClasses) implements Component {}
