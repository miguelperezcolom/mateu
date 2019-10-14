package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.MateuMDDEntity;

import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import lombok.MateuMDDEntity;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class ManyToOneFieldDemoDestinationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "";

    @OneToMany(mappedBy = "mapped")
    private List<ManyToOneFieldDemoEntity> mappers = new ArrayList<>();





    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof  ManyToOneFieldDemoDestinationEntity && id == ((ManyToOneFieldDemoDestinationEntity)obj).id);
    }

    @Override
    public String toString() {
        return stringField;
    }
}
