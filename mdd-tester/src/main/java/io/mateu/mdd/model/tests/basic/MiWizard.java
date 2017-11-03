package io.mateu.mdd.model.tests.basic;

import io.mateu.ui.mdd.server.BaseServerSideWizard;

public class MiWizard extends BaseServerSideWizard {

    public MiWizard() {
        add(new Pagina1());
        add(new Pagina2());
        add(new Pagina3());
    }

}
