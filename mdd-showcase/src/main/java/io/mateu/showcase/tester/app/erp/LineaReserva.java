package io.mateu.showcase.tester.app.erp;

import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.Money;
import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class LineaReserva {

    @ManyToOne
    private final Reserva reserva;

    private String concepto;

    private double precio;

    @KPI@Money
    private double total;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "linea", orphanRemoval = true)
    private List<DetalleLineaReserva> detalle = new ArrayList<>();

}
