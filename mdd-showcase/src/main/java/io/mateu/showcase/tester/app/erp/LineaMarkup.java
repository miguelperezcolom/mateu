package io.mateu.showcase.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class LineaMarkup {

    @NotNull@ManyToOne
    private final Markup markup;

    /*
    @ManyToOne@NotNull
    private final Agencia agencia;
     */

    private double porcentaje = 10.2;

    private int prioridad = 20;

}
