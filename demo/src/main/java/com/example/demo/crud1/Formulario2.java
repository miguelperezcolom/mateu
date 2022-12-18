package com.example.demo.crud1;

import lombok.Getter;
import lombok.Setter;

import java.util.concurrent.Callable;

@Getter@Setter
public class Formulario2 implements Callable<String> {

    private String x;

    @Override
    public String call() throws Exception {
        return "Hola " + x + "!";
    }
}
