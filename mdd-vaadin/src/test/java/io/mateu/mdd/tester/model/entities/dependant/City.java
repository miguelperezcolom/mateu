package io.mateu.mdd.tester.model.entities.dependant;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class City {

    @Id@GeneratedValue
    private long id;


    @ManyToOne@NotNull
    private State state;


    private String name;


    @Override
    public String toString() {
        return getName();
    }
}
