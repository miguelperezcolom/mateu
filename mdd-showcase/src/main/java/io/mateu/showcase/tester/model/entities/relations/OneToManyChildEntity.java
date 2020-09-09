package io.mateu.showcase.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.SearchFilter;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import java.io.Serializable;

@MateuMDDEntity
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
