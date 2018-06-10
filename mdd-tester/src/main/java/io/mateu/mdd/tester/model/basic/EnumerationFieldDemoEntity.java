package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
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
