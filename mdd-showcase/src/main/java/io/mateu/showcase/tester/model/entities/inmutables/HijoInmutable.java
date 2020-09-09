package io.mateu.showcase.tester.model.entities.inmutables;

import lombok.Getter;
import lombok.ToString;

import javax.persistence.*;

@Entity@Getter@ToString(exclude = {"padre"})
public class HijoInmutable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private final PadreInmutable padre;

    private final String nombre;

    private final int total;

    private HijoInmutable() {
        padre = null;
        nombre = null;
        total = 0;
    }

    public HijoInmutable(PadreInmutable padre, String nombre, int total) {
        this.padre = padre;
        this.nombre = nombre;
        this.total = total;
    }
}
