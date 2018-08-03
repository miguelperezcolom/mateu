package ${package};

import ${package}.model.Person;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.SimpleMDDApplication;

public class MyApp extends SimpleMDDApplication {

    @Action(value = "Say hello", order = 1)
    public String hello(String name) {
        return "Hello " + name + "!";
    }


    @Action(order = 2)
    public AbstractAction persons() {
        return new MDDOpenCRUDAction(Person.class);
    }

}