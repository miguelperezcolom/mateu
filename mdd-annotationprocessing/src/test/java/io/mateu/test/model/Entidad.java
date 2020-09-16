package io.mateu.test.model;

import com.sun.istack.NotNull;
import lombok.MateuMDDEntity;

@MateuMDDEntity
public class Entidad {

    private String name;

    @NotNull
    private Estado estado = Estado.Vivo;

}
