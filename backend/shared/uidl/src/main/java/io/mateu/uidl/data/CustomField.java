package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A form field slot that holds an arbitrary component with a label. */
@Builder
public record CustomField(
    String label, Component content, String style, String cssClasses, int colspan)
    implements Component {}
