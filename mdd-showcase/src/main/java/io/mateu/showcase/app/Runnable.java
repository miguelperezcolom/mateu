package io.mateu.showcase.app;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.VisibleIf;
import io.mateu.util.notification.Notifier;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;
import java.io.File;
import java.util.List;

@MateuUI(path = "/runnable")
@Getter@Setter
public class Runnable implements java.lang.Runnable {

    @NotEmpty
    String nombre;

    boolean empadronado;

    @VisibleIf("$this.empadronado")
    String poblacion = "Palma de Mallorca";

    File foto;

    @Action(order = 10)
    public String registrar() {
        return "Gracias por registrarte, " + nombre;
    }

    @Action(order = 20)
    public Direccion devuelveDatos() {
        return new Direccion();
    }

    @Action(order = 30)
    public DireccionReadOnly devuelveDatosSalida() {
        return new DireccionReadOnly();
    }

    @Action(order = 40)
    public int[] devuelveEnteros() {
        return new int[] {1,2,1,45};
    }

    @Action(order = 50)
    public List<String> devuelveLista() {
        return Lists.newArrayList("a", "b", "c");
    }

    @Action(order = 60)
    public File devuelveFichero() {
        return foto;
    }

    @Override
    public void run() {
        Notifier.alert("Hecho!");
    }
}
