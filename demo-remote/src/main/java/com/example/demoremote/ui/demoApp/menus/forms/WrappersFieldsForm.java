package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.ReadOnly;

public class WrappersFieldsForm {

    String name;

    Integer age;

    Double rating;

    Boolean citizen;

    @ReadOnly
    String assessment;


    @Action
    public void assess() {
        assessment = "" + name
        + ", " + age
        + ", " + rating
        + ", " + citizen;
    }

}
