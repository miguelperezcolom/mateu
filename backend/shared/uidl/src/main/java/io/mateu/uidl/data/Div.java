package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import java.util.List;
import lombok.Builder;

@Builder
public record Div(String content, List<Component> children, String style, String cssClasses)
    implements Component {

  public Div(String content) {
    this(content, List.of(), "", "");
  }

  public Div(List<Component> children) {
    this("", children, "", "");
  }
}
