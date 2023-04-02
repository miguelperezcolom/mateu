package com.example.demoremote.ui.forms;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;
import lombok.Getter;
import lombok.Setter;

@MateuUI("/simpleform")
@Getter@Setter
public class SimpleForm {

    private String name;

    private int age;

    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = "" + name + ", " + age;
    }

}
