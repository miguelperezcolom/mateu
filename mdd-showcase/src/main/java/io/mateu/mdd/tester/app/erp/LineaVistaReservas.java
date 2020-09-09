package io.mateu.mdd.tester.app.erp;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class LineaVistaReservas {

    private long id;

    private String titular;

    public LineaVistaReservas(long id, String titular) {
        this.id = id;
        this.titular = titular;
    }

    @Override
    public String toString() {
        return "" + id;
    }
}
