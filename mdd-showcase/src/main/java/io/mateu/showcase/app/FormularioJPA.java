package io.mateu.showcase.app;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.annotations.VisibleIf;
import lombok.Getter;
import lombok.MateuMDDEntity;
import lombok.Setter;

import javax.validation.constraints.NotEmpty;
import java.io.File;
import java.util.List;

@MateuUI(path = "/formulariojpa")
@MateuMDDEntity
public class FormularioJPA {

    @NotEmpty
    String nombre;

    boolean empadronado;

    @VisibleIf("$this.empadronado")
    String poblacion = "Palma de Mallorca";

    File foto;

    @Action(order = 50)
    public List<String> devuelveLista() {
        return Lists.newArrayList("a", "b", "c");
    }

}
