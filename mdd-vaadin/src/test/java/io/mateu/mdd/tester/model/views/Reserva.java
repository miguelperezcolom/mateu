package io.mateu.mdd.tester.model.views;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class Reserva {

    private long id;

    private String leadName;

    public Reserva(long id, String leadName) {
        this.id = id;
        this.leadName = leadName;
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj instanceof Reserva && id == ((Reserva) obj).getId());
    }

    @Override
    public String toString() {
        return "" + id;
    }
}
