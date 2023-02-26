package com.example.demo.e2e.forms;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import io.mateu.mdd.shared.annotations.SameLine;
import lombok.Getter;
import lombok.Setter;

import java.net.MalformedURLException;
import java.net.URL;

@Getter@Setter
public class UrlFieldForm {

    private URL editable;

    @Output
    private URL output = new URL("https://www.google.es");

    @Output
    private String assessment;

    public UrlFieldForm() throws MalformedURLException {
    }

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        return editable != null?editable.toString():"url is null";
    }

}
