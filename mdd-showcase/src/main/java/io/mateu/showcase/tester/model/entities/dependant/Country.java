package io.mateu.showcase.tester.model.entities.dependant;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class Country {

    @Id@GeneratedValue
    private long id;


    private String name;


    @Override
    public String toString() {
        return getName();
    }
}
