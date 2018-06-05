package io.mateu.mdd.tester.model.basic;

import io.mateu.mdd.core.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotNull;

@Entity
@Getter@Setter
public class CalculatedFieldsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private int intField;

    public void setIntField(int infField) {
        this.intField = infField;
        setCalculated(intField * 2);
        setCalculatedAlso(intField * 3);
        setCalculatedAndPersistent(intField * 4);
    }


    @Transient
    private int calculated;

    transient int calculatedAlso;

    @Output
    private int calculatedAndPersistent;

}
