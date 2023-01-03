package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotBlank;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter@Setter
public class BasicForm {

    private String name;

    private int age;

    private double rating;

    private float width;

    private boolean selected;

    private LocalDate date;

    private LocalDateTime dateTime;

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
        return "" + name + "," + age + "," + rating + "," + width + "," + selected + "," + date + "," + dateTime;
    }

}
