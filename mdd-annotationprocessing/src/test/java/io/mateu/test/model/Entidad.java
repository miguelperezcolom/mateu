package io.mateu.test.model;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Fake;
import lombok.MateuMDDEntity;

import javax.validation.constraints.NotNull;

@MateuMDDEntity
public class Entidad {

    private String name;

    @NotNull
    private Estado estado = Estado.Vivo;

    @Action@Fake
    public void metodo(String name) {
        System.out.println("Hola " + name);
    }

}
