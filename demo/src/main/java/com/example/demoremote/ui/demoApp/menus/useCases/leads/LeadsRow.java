package com.example.demoremote.ui.demoApp.menus.useCases.leads;

import io.mateu.mdd.core.app.ColumnAction;
import io.mateu.mdd.core.app.ColumnActionGroup;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LeadsRow {

  String id;

  String name;

  public LeadsRow(String id, String name) {
    this.id = id;
    this.name = name;
  }

  ColumnActionGroup actions =
      new ColumnActionGroup(
          new ColumnAction[] {
            new ColumnAction("block", "Block", null), new ColumnAction("activate", "Activate", null)
          });
}