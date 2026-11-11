package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A workflow-definition editor component. {@code value} is the JSON WorkflowDefinition string.
 * {@code id} names the state key the edited definition is written to (a field of the view model).
 */
@Builder
public record Workflow(String id, String value, String style, String cssClasses)
    implements Component {

  /** Without an id: the edited definition is bound to no field of the view model. */
  public Workflow(String value, String style, String cssClasses) {
    this(null, value, style, cssClasses);
  }
}
