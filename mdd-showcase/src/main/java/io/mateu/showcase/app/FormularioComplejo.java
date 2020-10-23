package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.Embed;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;

@MateuUI(path = "/formulariocomplejo")
@Getter@Setter
public class FormularioComplejo {

    @NotEmpty
    String nombre = "Mateu";

    @Embed
    Datos datos;

    @Embed
    Direccion direccion;

    @Action
    public String registrar() {
        return "Gracias por registrarte, " + nombre + ", nif = " + datos.nif + ", calle = " + direccion.calle;
    }

}
