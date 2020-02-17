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
public class Reserva {

    @ManyToOne
    private Agencia agencia;

    @NotEmpty
    private String leadName;

    @TextArea
    private String comentarios;

    @KPI
    private String estado;

    @KPI@Money@Balance@Sum
    private double total;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "reserva")
    @NotInlineEditable@FieldsFilter("concepto as 'Mi concepto'(900),total")
    private List<LineaReserva> lineas = new ArrayList<>();
}
