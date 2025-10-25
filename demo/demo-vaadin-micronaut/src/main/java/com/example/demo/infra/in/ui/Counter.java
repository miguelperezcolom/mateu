package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.interfaces.Page;

@MateuUI("/counter")
public class Counter implements Page {

    int count;

    @Action(type = ActionType.Main)
    void add() {
        count++;
    }

}
