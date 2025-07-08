package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record VirtualList(Page<?> page, String style, String cssClasses) implements Component {}
