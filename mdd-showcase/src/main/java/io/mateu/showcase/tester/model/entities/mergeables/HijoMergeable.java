package io.mateu.showcase.tester.model.entities.mergeables;

import lombok.AccessLevel;
import lombok.MateuMDDEntity;
import lombok.NoArgsConstructor;
import lombok.ToString;

import javax.persistence.*;

@MateuMDDEntity@ToString(exclude = {"padre"})@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class HijoMergeable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(cascade = CascadeType.MERGE)
    private PadreMergeable padre;

    private String nombre;

    private int total;

    public void setTotal(int total) {
        this.total = total;
        padre.actualizarTotal();
    }

    public HijoMergeable(PadreMergeable padre, String nombre, int total) {
        this.padre = padre;
        this.nombre = nombre;
        this.total = total;
    }
}
