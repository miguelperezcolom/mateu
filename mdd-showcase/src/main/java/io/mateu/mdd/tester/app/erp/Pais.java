package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import java.util.HashSet;
import java.util.Set;

@MateuMDDEntity
public class Pais {

    @Id
    private String codigo;

    private String nombre;

    @OneToMany(mappedBy = "pais", cascade = CascadeType.ALL)
    private Set<Provincia> provincias = new HashSet<>();

}
