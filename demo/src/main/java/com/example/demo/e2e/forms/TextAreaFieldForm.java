package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.annotations.TextArea;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;

@Getter@Setter
public class TextAreaFieldForm {

    @TextArea
    private String text;

    @Output
    private String assessment;

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        return text;
    }

}
