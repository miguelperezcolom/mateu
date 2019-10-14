package io.mateu.mdd.tester.model.entities.relations;

import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import lombok.MateuMDDEntity;
import javax.persistence.Id;

@MateuMDDEntity
public class MapKeyEntity {

    @Id@GeneratedValue
    private long id;

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
        return this == obj || (obj != null && obj instanceof MapKeyEntity && id == ((MapKeyEntity)obj).id);
    }

}
