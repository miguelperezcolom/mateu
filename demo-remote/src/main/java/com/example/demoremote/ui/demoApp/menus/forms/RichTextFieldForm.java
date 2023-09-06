package com.example.demoremote.ui.demoApp.menus.forms;

import io.mateu.mdd.shared.annotations.*;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class RichTextFieldForm {

    @Section("Basic")
    //@NotEmpty
    @RichText
    //@Placeholder("This should appear as the placeholder")
    private String text = "Mateu";

    @Section("Assessment")
    @ReadOnly
    private String assessment;

    @Action
    public void assess() {
        assessment = ""
                + "" + text
        ;
    }

    public String toString() {
        return "Text";
    }

}
