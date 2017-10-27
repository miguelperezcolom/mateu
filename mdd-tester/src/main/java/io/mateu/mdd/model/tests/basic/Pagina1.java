package io.mateu.mdd.model.tests.basic;

import io.mateu.ui.mdd.server.AbstractServerSideWizardPage;
import io.mateu.ui.mdd.server.annotations.Required;
import lombok.Getter;
import lombok.Setter;

@Setter@Getter
public class Pagina1 extends AbstractServerSideWizardPage {

    @Required
    private String nombre;

    private String apellidos;

    @Override
    public String getTitle() {
        return "Paso 1";
    }
}
