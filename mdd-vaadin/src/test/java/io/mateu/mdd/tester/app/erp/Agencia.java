package io.mateu.mdd.tester.app.erp;

import io.mateu.mdd.core.annotations.Password;
import lombok.MateuMDDEntity;

import javax.persistence.ManyToOne;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Agencia {

    private String nombre;

    @Password
    private String pwd;

    @ManyToOne@NotNull
    private Localidad localidad;

    @ManyToOne
    private Agencia central;

}
