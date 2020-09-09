package io.mateu.showcase.tester.model.entities.relations;

import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.showcase.tester.model.entities.basic.BasicFieldsDemoEntity;
import lombok.MateuMDDEntity;

import javax.persistence.*;

@MateuMDDEntity
public class OwnedManyToOneFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    @ManyToOne(cascade = CascadeType.ALL)
    private BasicFieldsDemoEntity basicFields;


}
