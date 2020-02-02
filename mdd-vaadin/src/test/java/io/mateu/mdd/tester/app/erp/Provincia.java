package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;
import javax.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

@MateuMDDEntity
public class Provincia {

    private String nombre;

    @ManyToOne@NotNull
    private Pais pais;

    @OneToMany(mappedBy = "provincia", cascade = CascadeType.ALL)
    private Set<Localidad> localidades = new HashSet<>();

}
