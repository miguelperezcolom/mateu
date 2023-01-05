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
        if (pojos == null) return "collection is null";
        if (pojos.size() == 0) return "empty collection";
        StringBuilder sb = new StringBuilder();
        sb.append("size = " + pojos.size());
        pojos.forEach(p -> sb.append("," + p));
        return sb.toString();
    }

    @Override
    public String getTitle() {
        return "Form with a pojo field";
    }
}
