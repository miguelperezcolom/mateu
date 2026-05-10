package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A workflow-definition editor component using ELK for graph layout. {@code value} is the JSON
 * WorkflowDefinition string.
 */
@Builder
public record WorkflowElk(String value, String style, String cssClasses) implements Component {}
