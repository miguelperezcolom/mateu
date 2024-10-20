package com.example.demo.domain.programmingLanguages;

import io.mateu.core.domain.uidefinition.core.app.ColumnAction;
import io.mateu.core.domain.uidefinition.core.app.ColumnActionGroup;
import io.mateu.core.domain.uidefinition.shared.annotations.Ignored;
import io.mateu.core.domain.uidefinition.shared.annotations.Width;
import io.mateu.core.domain.uidefinition.shared.data.Status;
import io.mateu.core.domain.uidefinition.shared.data.StatusType;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode(of = "id")
public class LanguageRow {

  @Ignored private String id;

  private String name;

  @Width("150px")
  private LanguageTarget target;

  @Width("150px")
  private Status status = new Status(StatusType.INFO, "New record");

  public enum LanguageTarget {
    Backend,
    Frontend
  }

  public LanguageRow(String id, String name, LanguageTarget target, Status status) {
    this.id = id;
    this.name = name;
    this.target = target;
    this.status = status;
  }

  private ColumnActionGroup actions;

  public ColumnActionGroup getActions() {
    if (status != null && StatusType.DANGER.equals(status.getType())) {
      return new ColumnActionGroup(
          new ColumnAction[] {
            new ColumnAction("unblockRow", "Unblock", null),
            new ColumnAction("deleteRow", "Delete", null)
          });
    }
    return new ColumnActionGroup(new ColumnAction[] {new ColumnAction("blockRow", "Block", null)});
  }

  @Override
  public String toString() {
    return name;
  }
}
