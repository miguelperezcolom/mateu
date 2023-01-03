package com.example.demo.e2e.dtos;

import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Ignored;
import io.mateu.mdd.shared.annotations.Output;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data@EqualsAndHashCode(of = "id")
public class SamplePojo implements HasTitle {

    @Ignored
    private final String id = UUID.randomUUID().toString();

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

    public SamplePojo(String name, int age) {
        this.name = name;
        this.age = age;
    }
}
