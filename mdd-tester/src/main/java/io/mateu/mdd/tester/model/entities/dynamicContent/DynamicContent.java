package io.mateu.mdd.tester.model.entities.dynamicContent;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Getter@Setter
public class DynamicContent {


    private String name;


    @Override
    public String toString() {
        return getName();
    }
}
