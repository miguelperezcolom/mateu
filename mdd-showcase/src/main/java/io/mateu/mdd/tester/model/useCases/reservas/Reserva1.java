package io.mateu.mdd.tester.model.useCases.reservas;

import io.mateu.mdd.core.annotations.Money;
import io.mateu.mdd.core.interfaces.Card;
import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@MateuMDDEntity
public class Reserva1 { // implements Card {

    @ManyToOne@NotNull
    private final File1 file;

    private LocalDate del;

    private LocalDate al;

    private String servicio;

    @Money
    private double precio;

    //@Override
    public String toHtml() {
        String h = "<table >";
        h += "<tr><th width='150px'>Dates:</th><td>From " + del + " to " + al + "</td></tr>";
        h += "<tr><th>Text:</th><td>" + servicio + "</td></tr>";
        h += "<tr><th>Price:</th><td>" + precio + "</td></tr>";
        h += "</table>";
        return h;
    }
}
