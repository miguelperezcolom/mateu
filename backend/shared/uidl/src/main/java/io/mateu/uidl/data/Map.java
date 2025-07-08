package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Map(String position, String zoom, String style, String cssClasses)
    implements Component {}
