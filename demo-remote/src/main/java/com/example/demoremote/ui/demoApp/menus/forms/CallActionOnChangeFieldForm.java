package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data@Caption("Disable field")
public class CallActionOnChangeFieldForm {

    @Section("Basic")
    private String name = "Mateu";

    @Placeholder("This should appear as the placeholder")
    private String withPlaceholder;

    @CallActionOnChange("assess")
    private int age = 15;

    @CallActionOnChange("assess")
    private double balance = 20.31;

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment =
                "" + name
                + ", " + age
                + ", " + balance
        ;
    }


}
