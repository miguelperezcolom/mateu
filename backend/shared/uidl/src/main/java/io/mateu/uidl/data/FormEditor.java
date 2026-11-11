package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/**
 * A form-definition editor component. {@code value} is the JSON FormDefinition string. {@code id}
 * names the state key the edited definition is written to (a field of the view model).
 */
@Builder
public record FormEditor(String id, String value, String style, String cssClasses)
    implements Component {

  /** Without an id: the edited definition is bound to no field of the view model. */
  public FormEditor(String value, String style, String cssClasses) {
    this(null, value, style, cssClasses);
  }
}
