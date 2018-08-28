package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Getter@Setter
public class OneToManyChildEntity implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "";

    @ManyToOne
    private OneToManyParentEntity parent;





    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        boolean eq = this == obj || (obj != null && obj instanceof OneToManyChildEntity && id == ((OneToManyChildEntity)obj).id);
        if (eq && id == 0) eq = this == obj;
        return eq;
    }

    @Override
    public String toString() {
        return stringField;
    }
}
