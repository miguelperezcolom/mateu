package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.Page;

@UI("/counter")
@Title("")
public class Counter {

    @ReadOnly
    int count;

    @Button
    void add() {
        count++;
    }

}
