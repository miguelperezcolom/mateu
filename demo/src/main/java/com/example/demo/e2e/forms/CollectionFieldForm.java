package com.example.demo.e2e.forms;

import com.example.demo.e2e.dtos.SamplePojo;
import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter@Setter
public class CollectionFieldForm implements HasTitle {

    private List<SamplePojo> pojos;

    @Output
    private String assessment;

    @Action
    public void oneAction() {
        assessment = dump();
    }

    private String dump() {
        return "" + pojos.size();
    }

    @Override
    public String getTitle() {
        return "Form with a pojo field";
    }
}
