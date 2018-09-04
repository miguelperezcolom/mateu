package io.mateu.mdd.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.Owned;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
public class OwnedManyToOneFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    @ManyToOne
    @Owned
    private BasicFieldsDemoEntity basicFields;


}
