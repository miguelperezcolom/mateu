package io.mateu.uidl.data;

import io.mateu.uidl.fluent.Component;
import lombok.Builder;

/** One cell of a board row holding a component, spanning a number of board columns. */
@Builder
public record BoardLayoutItem(Component content, String style, String cssClasses, int boardCols)
    implements Component {

  public BoardLayoutItem(Component content, int boardCols) {
    this(content, "", "", boardCols);
  }
}
