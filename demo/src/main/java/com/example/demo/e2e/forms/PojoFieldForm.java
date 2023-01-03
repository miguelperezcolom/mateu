package com.example.demo.e2e.forms;

import com.example.demo.e2e.forms.dtos.SamplePojo;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class PojoFieldForm implements HasTitle {

    private SamplePojo pojo;

    @Output
    private String assessment;

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        return "" + pojo;
    }

    @Override
    public String getTitle() {
        return "Form with a pojo field";
    }
}
