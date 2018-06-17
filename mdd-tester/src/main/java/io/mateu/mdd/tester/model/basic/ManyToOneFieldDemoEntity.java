package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
public class ManyToOneFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity simple;

    @ManyToOne
    private ManyToOneFieldDemoDestinationEntity mapped;






    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (obj != null && obj instanceof  ManyToOneFieldDemoEntity && id == ((ManyToOneFieldDemoEntity)obj).id);
    }

}
