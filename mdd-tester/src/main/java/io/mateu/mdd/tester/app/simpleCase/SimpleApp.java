package io.mateu.mdd.tester.app.simpleCase;

import com.google.common.base.Strings;
import com.google.common.collect.Lists;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.annotations.SubApp;
import io.mateu.mdd.core.app.*;
import io.mateu.mdd.core.util.Helper;
import io.mateu.mdd.tester.model.entities.basic.BasicFieldsDemoEntity;

import java.io.IOException;
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

    @Action(order = 5)
    public String repeat(String string, int count) {
        return Strings.repeat(string, count);
    }


    @Action(order = 6)
    public String md5(String s) {
        return Helper.md5(s);
    }

    @Action(order = 7)
    public String getThreadName() {
        return Thread.currentThread().getName();
    }

    @Action(order = 8)
    public String ls() throws IOException {
        return Helper.toHtml(Helper.runCommand("ls -lh"));
    }


    @Action(order = 9)
    public String df() throws IOException {
        return Helper.toHtml(Helper.runCommand("df -h"));
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
