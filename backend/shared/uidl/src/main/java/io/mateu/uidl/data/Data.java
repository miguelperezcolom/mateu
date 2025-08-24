package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record Data(Object data, String style, String cssClasses, Object newState)
    implements Component {

  public Data(Object data) {
    this(data, "", "", null);
  }

  public Data(Object data, Object newState) {
    this(data, "", "", newState);
  }
}
