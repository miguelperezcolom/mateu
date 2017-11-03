package io.mateu.mdd.model.tests.basic;

import io.mateu.ui.mdd.server.AbstractServerSideWizardPage;
import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.NotNull;
import java.util.Arrays;
import java.util.List;

@Setter@Getter
public class Pagina1 extends AbstractServerSideWizardPage {

    @NotNull
    private String nombre = "valor por defecto";

    private String apellidos = "tus apellidos";

    private List<Occupation> occupations = Arrays.asList(new Occupation());


    @Override
    public String getTitle() {
        return "Paso 1";
    }
}
