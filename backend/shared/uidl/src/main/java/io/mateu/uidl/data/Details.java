package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Details(String title, Component content, String style, String cssClasses)
    implements Component {}
