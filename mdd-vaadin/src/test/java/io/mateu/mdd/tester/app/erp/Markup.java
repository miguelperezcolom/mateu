package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.annotations.*;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class Markup {

    @NotEmpty
    private String name;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "markup")
    @UseComponentsToEditValues
    private List<LineaMarkup> lineas = new ArrayList<>();

    public void setLineas(List<LineaMarkup> lineas) {
        this.lineas = lineas;
        total = lineas.stream().mapToDouble(l -> l.getPorcentaje()).sum();
    }

    @Output
    private double total;

}
