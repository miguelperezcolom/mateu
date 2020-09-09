package io.mateu.mdd.tester.app.erp;

import com.google.common.base.Strings;
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
    private final Agencia agencia;

    @NotEmpty
    private String leadName;

    public boolean isLeadNameVisible() {
        return true;
    }

    @TextArea
    private String comentarios;

    @VisibleIf("!!$this.comentarios")
    private boolean comentariosPrivados;

    @KPI
    private String estado;

    @KPI@Money@Balance@Sum
    private double total;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "reserva")
    @NotInlineEditable@FieldsFilter("concepto as 'Mi concepto'(900),total")
    private List<LineaReserva> lineas = new ArrayList<>();
}
