package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record KPI(String title, String text, String style, String cssClasses)
    implements Component {}
