package io.mateu.mdd.tester.model.entities.dynamicContent;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class DynamicContent {


    private String name;


    @Override
    public String toString() {
        return getName();
    }
}
