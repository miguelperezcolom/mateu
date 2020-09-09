package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.persistence.CascadeType;
import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Localidad {

    private String nombre;

    @ManyToOne(cascade = CascadeType.ALL)@NotNull
    private Provincia provincia;
}
