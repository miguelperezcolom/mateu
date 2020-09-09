package io.mateu.mdd.tester.model.entities.converter;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class SerializableContent {


    private String name;

    private int age;


    @Override
    public String toString() {
        return getName();
    }
}
