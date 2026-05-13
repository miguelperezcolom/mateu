package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A form-definition editor component. {@code value} is the JSON FormDefinition string. */
@Builder
public record FormEditor(String value, String style, String cssClasses) implements Component {}
