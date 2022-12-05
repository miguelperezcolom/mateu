package com.example.demo.crud1;

import io.mateu.mdd.shared.annotations.Caption;
import lombok.Data;

import java.util.concurrent.Callable;

@Data
@Caption("YYYYYYYYYY")
public class Editor1 implements Callable<String> {

    private String name;

    private int age;

    public String toString() {
        return "XXXXXXXXXXX";
    }


    @Override
    public String call() throws Exception {
        return "Hola!!!";
    }
}
