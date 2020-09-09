package io.mateu.showcase.tester.model.entities.relations;


import io.mateu.mdd.core.annotations.Output;
import io.mateu.showcase.tester.model.entities.basic.DemoEnumeration;
import lombok.Getter;
import lombok.Setter;

import java.io.Serializable;

@Getter@Setter
public class CollectionElement implements Serializable {

    private String description;

    private DemoEnumeration tag;


    // when filled this will throw an exception as BasicFieldsDemoEntity is not serializable itself
    //@ManyToOne
    //private BasicFieldsDemoEntity referenced;

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
