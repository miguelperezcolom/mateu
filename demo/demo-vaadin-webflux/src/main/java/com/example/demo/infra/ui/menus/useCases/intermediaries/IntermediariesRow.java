package com.example.demo.infra.ui.menus.useCases.intermediaries;

import io.mateu.uidl.core.app.ColumnAction;
import io.mateu.uidl.core.app.ColumnActionGroup;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class IntermediariesRow {

  String id;

  String name;

  public IntermediariesRow(String id, String name) {
    this.id = id;
    this.name = name;
  }

  ColumnActionGroup actions =
      new ColumnActionGroup(
          new ColumnAction[] {
            new ColumnAction("block", "Block", null), new ColumnAction("activate", "Activate", null)
          });
}
