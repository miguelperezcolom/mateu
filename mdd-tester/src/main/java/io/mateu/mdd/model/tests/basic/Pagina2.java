package io.mateu.mdd.model.tests.basic;

import io.mateu.ui.mdd.server.AbstractServerSideWizardPage;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class Pagina2 extends AbstractServerSideWizardPage {

    private int edad = 5;

    private boolean casado = true;

    @Override
    public String getTitle() {
        return "Paso 2";
    }
}
