package io.mateu.mdd.tester.model.entities.basic;

import io.mateu.mdd.core.annotations.Output;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Entity
@Getter@Setter
public class CalculatedFieldsDemoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;


    private int intField;

    public void setIntField(int infField) {
        this.intField = infField;
        setCalculatedAndPersistent(intField * 4);
    }


    @Transient
    private int calculated;

    public int getCalculated() {
        return intField * 2;
    }

    transient int calculatedAlso;

    public int getCalculatedAlso() {
        return intField * 3;
    }

    @Output
    private int calculatedAndPersistent;

}
