package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import io.mateu.uidl.app.ColumnAction;
import io.mateu.uidl.app.ColumnActionGroup;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class BrokenRow {

  String id;

  String name;

  public BrokenRow(String id, String name) {
    this.id = id;
    this.name = name;
  }

  ColumnActionGroup actions =
      new ColumnActionGroup(
          new ColumnAction[] {
            new ColumnAction("block", "Block", null), new ColumnAction("activate", "Activate", null)
          });
}
