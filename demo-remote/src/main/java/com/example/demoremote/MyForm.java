package com.example.demoremote;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import lombok.Data;

@MateuUI(path = "")
@Data
public class MyForm {

    private String name = "Mateu";

    private int age;

    private String assessment;


    @Action
    public void assess() {
        assessment = "" + name + ", " + age;
    }

    public String toString() {
        return "This is a sample form";
    }

}
