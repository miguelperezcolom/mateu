package io.mateu.mdd.tester.app.helloWorld;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.mdd.tester.model.entities.groups.Person;

public class HelloWorldApp extends SimpleMDDApplication {

    @Action
    public AbstractAction people() {

        return new MDDOpenCRUDAction(Person.class);

    }

}
