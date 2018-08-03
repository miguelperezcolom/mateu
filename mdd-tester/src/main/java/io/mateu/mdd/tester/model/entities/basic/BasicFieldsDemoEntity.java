package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.Sum;
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

    @Sum
    private int intField;

    @Sum
    private long longField;

    @Sum
    private double doubleField;

    private boolean booleanField;

}
