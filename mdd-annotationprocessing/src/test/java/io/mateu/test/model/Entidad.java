package io.mateu.test.model;

import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.core.annotations.Fake;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.util.UUID;

@Entity
public class Entidad {

    private String name;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    private String test;

    @NotNull
    private final String number = UUID.randomUUID().toString();


    @NotNull
    private Estado estado = Estado.Vivo;

    @Action@Fake@Enumerated(value = EnumType.STRING)
    public void metodo(String name) {
        System.out.println("Hola " + name);
    }

}
