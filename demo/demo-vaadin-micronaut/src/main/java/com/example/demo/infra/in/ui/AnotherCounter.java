package com.example.demo.infra.in.ui;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.UI;

@UI("/anothercounter")
public class AnotherCounter {

    int count;

    @Button
    void add() {
        count++;
    }

}
