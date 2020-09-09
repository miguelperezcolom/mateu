package io.mateu.showcase.test.model;

import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.OneToMany;
import java.util.ArrayList;
import java.util.List;

@MateuMDDEntity
public class Padre {

    private String name;

    private long total;

    @OneToMany(cascade = CascadeType.ALL, mappedBy = "padre")
    private List<Hijo> hijos = new ArrayList<>();

    public Padre(String name) {
        this.name = name;
    }

    public void actualizaTotal() {
        total = hijos.stream().mapToLong(h -> h.getSaldo()).sum();
    }
}
