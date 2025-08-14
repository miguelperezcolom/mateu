package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Details(
    Component summary, Component content, String style, String cssClasses, boolean opened)
    implements Component {}
