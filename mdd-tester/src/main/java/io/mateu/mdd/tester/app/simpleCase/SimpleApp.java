package io.mateu.mdd.tester.app.simpleCase;

import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.SubApp;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;

import java.util.List;

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


    @SubApp(order = 3)
    public SubMenu aSubMenu() {
        return new SubMenu();
    }

    @Action(order = 4)
    public List<MenuEntry> anotherSubMenu() {
        return Lists.newArrayList(new AbstractAction("Say hello") {
            @Override
            public void run(MDDExecutionContext context) {
                System.out.println("hello");
            }
        }, new AbstractAction("Say bye") {
            @Override
            public void run(MDDExecutionContext context) {
                System.out.println("bye");
            }
        });
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
