package io.mateu.showcase.app.extended;

import io.mateu.mdd.shared.annotations.Action;
import lombok.Getter;
import lombok.Setter;

@Getter@Setter
public class Formulario {

    String nombre;

    String apellidos;

    @Action
    public String registrarse() {
        return "Gracias por registrarte, " + nombre;
    }


}
