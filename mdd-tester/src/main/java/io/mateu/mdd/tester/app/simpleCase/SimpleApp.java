package io.mateu.mdd.tester.app.simpleCase;

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;

@Caption("My simple app")
public class SimpleApp extends SimpleMDDApplication {



    @Action(value = "Say hello", order = 1)
    public String hello(String name) {
        return "Hello " + name + "!";
    }


    @Action(order = 2)
    public AbstractAction maintainEntities() {
        return new MDDOpenCRUDAction(BasicFieldsDemoEntity.class);
    }


    @Override
    public boolean isAuthenticationNeeded() {
        return true;
    }

    @Override
    public boolean isOAuthAllowed() {
        return false;
    }
}
