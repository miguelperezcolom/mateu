package io.mateu.mdd.tester.model.entities.relations;


import io.mateu.mdd.core.annotations.Output;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;
import io.mateu.mdd.tester.model.entities.basic.DemoEnumeration;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.Embeddable;
import javax.persistence.ManyToOne;

@Getter@Setter
@Embeddable
public class CollectionElement {

    private String description;

    private DemoEnumeration tag;

    @ManyToOne
    private BasicFieldsDemoEntity referenced;

    private int units;

    private double cost;

    @Output
    private double total;

    public void setUnits(int units) {
        this.units = units;
        setTotal(units * cost);
    }

    public void setCost(double cost) {
        this.cost = cost;
        setTotal(units * cost);
    }

}
