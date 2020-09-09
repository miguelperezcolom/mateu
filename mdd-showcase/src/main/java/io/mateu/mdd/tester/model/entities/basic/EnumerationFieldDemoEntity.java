package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.MateuMDDEntity;

import javax.persistence.*;

@MateuMDDEntity
public class EnumerationFieldDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField;

    @Enumerated(EnumType.STRING)
    private DemoEnumeration enumerationFieldAsString;

    private DemoEnumeration enumerationFieldAsOrdinal;

}
