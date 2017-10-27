package io.mateu.mdd.model.tests.basic;

import io.mateu.mdd.model.authentication.User;
import io.mateu.ui.mdd.server.BaseServerSideWizard;
import io.mateu.ui.mdd.shared.ActionType;
import io.mateu.ui.mdd.shared.MDDLink;

public class MiWizard extends BaseServerSideWizard {

    public MiWizard() {
        add(new Pagina1());
        add(new Pagina2());
        add(new Pagina3());
    }

}
