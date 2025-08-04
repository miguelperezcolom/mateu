package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

@Builder
public record BoardLayoutItem(Component content, String style, String cssClasses, int boardCols)
    implements Component {

  public BoardLayoutItem(Component content, int boardCols) {
    this(content, "", "", boardCols);
  }
}
