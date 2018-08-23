package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.FullWidth;
import io.mateu.mdd.core.annotations.Help;
import io.mateu.mdd.core.annotations.SearchFilter;
import io.mateu.mdd.core.annotations.Sum;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.DecimalMax;
import javax.validation.constraints.DecimalMin;
import javax.validation.constraints.Max;
import javax.validation.constraints.Min;

@Entity
@Getter@Setter
public class BasicFieldsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    @SearchFilter
    @Help("This is a simple field 1")
    private String stringField = "zzzz";

    @FullWidth
    private String fullWidthField;

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



    @Min(0)@Max(100)
    private int intRangeField;

    @DecimalMin("0")@DecimalMax("100")
    private double doubleRangeField;



    private Integer nonPrimitiveIntegerField;

    private Long nonPrimitiveLongField;

    private Double nonPrimitiveDoubleField;


    @Override
    public String toString() {
        return getStringField();
    }
}
