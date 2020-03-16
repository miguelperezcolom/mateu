package io.mateu.mdd.core.test;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class SamplePojo {

    private String name = "test";

    private boolean check;

    private int qt = 5;

    private double price = 10000;

    private double t;

    public String toString() {
        return "" + name + " " + check + " " + qt + " x " + price + " = " + t;
    }

}
