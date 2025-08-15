package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Popover(Component content, Component wrapped, String style, String cssClasses)
    implements Component {}
