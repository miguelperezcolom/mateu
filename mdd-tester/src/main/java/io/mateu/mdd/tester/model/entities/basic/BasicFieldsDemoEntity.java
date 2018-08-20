package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Help;
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
    @Help("This is a simple field 1")
    private String stringField = "zzzz";

    @Sum
    @Help("This is a simple field 2")
    private int intField;

    @Sum
    @Help("This is a simple field 3")
    private long longField;

    @Sum
    @Help("This is a simple field 4")
    private double doubleField;

    @Help("This is a simple field 5")
    private boolean booleanField;


    @Override
    public String toString() {
        return getStringField();
    }
}
