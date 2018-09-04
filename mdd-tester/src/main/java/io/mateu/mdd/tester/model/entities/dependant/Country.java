package io.mateu.mdd.tester.model.entities.dependant;

import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;

@Entity
@Getter@Setter
public class Country {

    @Id@GeneratedValue
    private long id;


    private String name;


    @Override
    public String toString() {
        return getName();
    }
}
