package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;

@Getter@Setter
public class BasicForm {

    private String name;

    private int age;

    private double rating;

    private float width;

    private boolean selected;

    @NotBlank
    private String canNotBeEmpty = "aa";

    @Output
    private String assessment;


    @Action
    public void oneAction() {
        assessment = dump();
    }

    @Action
    public void anotherAction(String yourName) {
        assessment = "Hello " + yourName + " / " + name + "!";
    }


    private String dump() {
        return "" + name + "," + age + "," + rating + "," + width + "," + selected;
    }

}
