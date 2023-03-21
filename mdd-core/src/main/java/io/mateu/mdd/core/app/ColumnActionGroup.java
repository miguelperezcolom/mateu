package io.mateu.mdd.core.app;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ColumnActionGroup {

    private ColumnAction[] actions;

    public ColumnActionGroup(ColumnAction[] actions) {
        this.actions = actions;
    }

    public ColumnActionGroup() {
    }
}
