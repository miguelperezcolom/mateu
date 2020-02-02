package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.annotations.KPI;
import io.mateu.mdd.core.annotations.Money;
import lombok.MateuMDDEntity;

@MateuMDDEntity
public class LineaReserva {

    private final Reserva reserva;

    private String concepto;

    private double precio;

    @KPI@Money
    private double total;

}
