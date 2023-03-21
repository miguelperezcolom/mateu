package com.example.demoremote.rpcCruds;

import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter@Setter
public class ColumnActionGroup extends ColumnAction {

    private ColumnAction[] actions;

    public ColumnActionGroup(ColumnAction[] actions) {
        super("grupo");
        this.actions = actions;
    }

    public ColumnActionGroup() {
        super("grupo");
    }
}
