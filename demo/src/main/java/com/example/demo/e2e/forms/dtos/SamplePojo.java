package com.example.demo.e2e.forms.dtos;

import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Data;

@Data
public class SamplePojo implements HasTitle {

    private String name;

    private int age;

    @Output
    private String assessment;

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        return "" + name + "," + age;
    }


    @Override
    public String getTitle() {
        return "Sample pojo " + name;
    }
}
