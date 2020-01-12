package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.UseIdToSelect;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
@UseIdToSelect
public class UseIdToSelectDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String name;



    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof UseIdToSelectDemoEntity && id == ((UseIdToSelectDemoEntity)obj).id);
    }


    @Override
    public String toString() {
        return getName();
    }
}
