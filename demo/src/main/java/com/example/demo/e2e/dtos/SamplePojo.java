package com.example.demo.e2e.dtos;

import io.mateu.mdd.core.interfaces.HasTitle;
import io.mateu.mdd.shared.annotations.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data@EqualsAndHashCode(of = "id")
@AllArgsConstructor@NoArgsConstructor
public class SamplePojo implements HasTitle {

    private String id = UUID.randomUUID().toString();

    @SearchFilter
    private String name;

    @SearchFilter
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

    public SamplePojo(String name, int age) {
        this.name = name;
        this.age = age;
    }

    @Override
    public String toString() {
        return name + "(" + age + ")";
    }
}
