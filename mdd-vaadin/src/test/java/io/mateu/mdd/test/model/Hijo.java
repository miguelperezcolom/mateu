package io.mateu.mdd.test.model;

import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;

@MateuMDDEntity
public class Hijo {

    @ManyToOne(cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    private final Padre padre;

    private String name;

    private long saldo;

    public void setSaldo(long saldo) {
        this.saldo = saldo;
        padre.actualizaTotal();
    }

    public Hijo(Padre padre, String name) {
        this.padre = padre;
        this.name = name;
    }
}
