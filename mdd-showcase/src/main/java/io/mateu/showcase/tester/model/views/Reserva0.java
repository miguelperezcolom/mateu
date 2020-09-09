package io.mateu.showcase.tester.model.views;

import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class Reserva0 {

    private long id;

    private String leadName;

    public Reserva0(long id, String leadName) {
        this.id = id;
        this.leadName = leadName;
    }

    @Override
    public boolean equals(Object obj) {
        return this == obj || (id > 0 && obj instanceof Reserva0 && id == ((Reserva0) obj).getId());
    }

    @Override
    public String toString() {
        return "" + id;
    }
}
