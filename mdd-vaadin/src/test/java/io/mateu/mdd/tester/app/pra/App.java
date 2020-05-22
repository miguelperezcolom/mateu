package io.mateu.mdd.tester.app.pra;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.mdd.tester.model.useCases.invoicing.Invoice;

public class App extends SimpleMDDApplication {

    @Action(order = 1)
    public int howMany() {
        return 2;
    }

    @Action(order = 2)
    public String sayHello(String yourName) {
        return "Hello " + yourName;
    }

    @Action(order = 3)
    public Class fruits() {
        return Fruit.class;
    }

    @Action(order = 4)
    public Class invoices() {
        return Inv.class;
    }

    @Override
    public boolean isAuthenticationNeeded() {
        return true;
    }

}



