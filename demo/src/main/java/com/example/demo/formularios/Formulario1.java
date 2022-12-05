package com.example.demo.formularios;

import com.example.demo.crud1.Crud2;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.Subtitle;
import lombok.Data;

import java.util.concurrent.Callable;

@Data
@Caption("Welcome to the wefox Insurance Portal")
@Subtitle("Here is an overview of our insurance products")
public class Formulario1 implements Callable<String> {

    private String name;

    private int age;

    private Crud2 crud;

    public String toString() {
        return "XXXXXXXXXXX";
    }


    @Override
    public String call() throws Exception {
        return "Hola!!!";
    }
}
