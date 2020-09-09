package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@MateuMDDEntity
public class DetalleLineaReserva {

    private final LineaReserva linea;

    @NotNull
    private LocalDate date;

    @NotEmpty
    private String descripcion;

    private double valor;

    @Override
    public String toString() {
        return "" + date + " " + descripcion + " " + valor;
    }

}
