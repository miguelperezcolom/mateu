package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A BPMN diagram rendered from BPMN 2.0 XML. */
@Builder
public record Bpmn(String xml, String style, String cssClasses) implements Component {}
