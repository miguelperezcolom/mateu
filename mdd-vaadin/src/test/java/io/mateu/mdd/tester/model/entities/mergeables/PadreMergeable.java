package io.mateu.mdd.tester.model.entities.mergeables;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity@Getter@Setter@ToString@Slf4j
public class PadreMergeable {

    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    private String nombre;

    @OneToMany(mappedBy = "padre", cascade = CascadeType.ALL)
    private List<HijoMergeable> hijos = new ArrayList<>();

    private int total;



    private PadreMergeable() {

    }

    public PadreMergeable(String nombre, int total) {
        this.nombre = nombre;
        this.total = total;
    }

    public void actualizarTotal() {
        total = hijos.stream().map(h -> h.getTotal()).reduce((t, v) -> t + v).get();
        log.debug("total padre actualizado a " + total);
    }
}
