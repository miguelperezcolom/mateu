package io.mateu.mdd.tester.app.erp;

import lombok.MateuMDDEntity;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Coste {

    @NotBlank
    private String name;

    @NotNull
    private EstadoCoste estado = EstadoCoste.Inicial;

}
