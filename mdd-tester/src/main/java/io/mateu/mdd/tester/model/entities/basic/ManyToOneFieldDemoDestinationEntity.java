package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter@Setter
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
