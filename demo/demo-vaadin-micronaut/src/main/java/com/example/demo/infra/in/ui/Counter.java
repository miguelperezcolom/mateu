package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.Page;

@UI("/counter")
public class Counter implements Page {

    int count;

    @Button
    void add() {
        count++;
    }

}
