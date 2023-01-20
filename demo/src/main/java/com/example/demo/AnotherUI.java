package com.example.demo;

import io.mateu.mdd.core.annotations.MateuUI;
import lombok.Getter;
import lombok.Setter;

@MateuUI(path = "/another")
@Getter@Setter
public class AnotherUI implements Runnable {

    private String name;

    @Override
    public void run() {

    }
}
