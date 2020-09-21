package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.MateuMDDUI;
import io.mateu.mdd.core.annotations.Submenu;
import io.mateu.mdd.core.app.MateuUI;
import io.mateu.showcase.domain.boundedContexts.educational.model.Grade;
import io.mateu.showcase.domain.boundedContexts.financial.model.Customer;

@MateuMDDUI(path = "")
public class MyUI extends MateuUI {

    @Action
    public Class customers = Customer.class;

}
