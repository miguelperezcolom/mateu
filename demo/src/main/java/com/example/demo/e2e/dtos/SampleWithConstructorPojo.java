package com.example.demo.e2e.dtos;

import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.NotInList;
import io.mateu.mdd.shared.annotations.Output;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.UUID;

@Data@EqualsAndHashCode(of = "id")
@AllArgsConstructor
public class SampleWithConstructorPojo implements HasTitle {

    private String id = UUID.randomUUID().toString();

    private String name;

    private int age;

    @Output@NotInList
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

    public SampleWithConstructorPojo(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}
