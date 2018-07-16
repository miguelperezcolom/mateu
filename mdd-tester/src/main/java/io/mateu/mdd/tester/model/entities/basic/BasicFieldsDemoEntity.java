package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
public class BasicFieldsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    private String stringField = "zzzz";

    private int intField;

    private long longField;

    private double doubleField;

    private boolean booleanField;

}
