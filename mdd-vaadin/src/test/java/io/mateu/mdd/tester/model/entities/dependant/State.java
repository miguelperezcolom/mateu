package io.mateu.mdd.tester.model.entities.dependant;

import io.mateu.mdd.core.annotations.DependsOn;
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
    private Country country;


    private String name;


    @Override
    public String toString() {
        return getName();
    }


    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof State && id == ((State)obj).id);
    }

}
