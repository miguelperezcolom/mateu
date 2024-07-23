package io.mateu.core.domain.uidefinition.core.app;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ColumnActionGroup {

  private ColumnAction[] actions;

  public ColumnActionGroup(ColumnAction[] actions) {
    this.actions = actions;
  }

  public ColumnActionGroup() {}
}
