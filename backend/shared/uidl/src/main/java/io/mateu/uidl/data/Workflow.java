package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** A workflow-definition editor component. {@code value} is the JSON WorkflowDefinition string. */
@Builder
public record Workflow(String value, String style, String cssClasses) implements Component {}
