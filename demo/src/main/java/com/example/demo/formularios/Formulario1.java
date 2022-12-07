package com.example.demo.formularios;

import com.example.demo.crud1.Crud2;
import io.mateu.mdd.shared.annotations.*;
import lombok.Data;

import java.util.concurrent.Callable;

@Data
@Caption("Welcome to the wefox Insurance Portal")
@Subtitle("Here is an overview of our insurance products")
@ActionsTitle("Privacy consent")
@ActionsText("Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.")
public class Formulario1 implements Callable<String> {

    @FieldGroup("All fields")
    private String name;

    private int age;


    @Section("")
    @FieldGroup("Children")
    private Crud2 crud;

    public String toString() {
        return "XXXXXXXXXXX";
    }


    @Override
    public String call() throws Exception {
        return "Hola!!!";
    }
}
