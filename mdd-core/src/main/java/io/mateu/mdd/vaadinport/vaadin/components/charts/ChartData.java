package io.mateu.mdd.vaadinport.vaadin.components.charts;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class ChartData {

    private Object line;

    private Object label;

    private double value;

    public ChartData(Object line, Object label, double value) {
        this.line = line;
        this.label = label;
        this.value = value;
    }
}
