package io.mateu.core.domain.uidefinition.core.app;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class ColumnActionGroup {

  private ColumnAction[] actions;

  public ColumnActionGroup(ColumnAction[] actions) {
    this.actions = actions;
  }

  public ColumnActionGroup() {}
}
