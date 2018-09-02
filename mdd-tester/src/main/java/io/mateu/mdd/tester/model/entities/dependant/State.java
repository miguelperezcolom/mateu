package io.mateu.mdd.tester.model.entities.dependant;

import io.mateu.mdd.core.annotations.SelectionFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class State {

    @Id@GeneratedValue
    private long id;

    @ManyToOne
    @NotNull
    @SelectionFilter
    private Country country;


    private String name;


    @Override
    public String toString() {
        return getName();
    }
}
