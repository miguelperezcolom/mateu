package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Agencia {

    private String nombre;

    @ManyToOne@NotNull
    private Localidad localidad;

}
