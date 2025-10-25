package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.ActionType;
import io.mateu.uidl.annotations.MateuUI;

@MateuUI("/anothercounter")
public class AnotherCounter {

    int count;

    @Action(type = ActionType.Main)
    void add() {
        count++;
    }

}
