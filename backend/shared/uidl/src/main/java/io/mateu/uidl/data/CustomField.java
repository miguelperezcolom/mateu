package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record CustomField(
    String label, Component content, String style, String cssClasses, int colspan)
    implements Component {}
