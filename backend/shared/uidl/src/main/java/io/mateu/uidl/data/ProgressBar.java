package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record ProgressBar(
    boolean indeterminate,
    int min,
    int max,
    double value,
    String valueKey,
    String text,
    String theme,
    String style,
    String cssClasses)
    implements Component {}
