package ${package};

import ${package}.model.Person;
import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.annotations.Caption;
import io.mateu.mdd.core.app.AbstractAction;
import io.mateu.mdd.core.app.MDDOpenCRUDAction;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.mdd.core.util.Helper;

public class MyApp extends SimpleMDDApplication {

    @Action(value = "Say hello", order = 1)
    public String hello(String name) {
        return "Hello " + name + "!";
    }


    @Action(order = 2)
    public AbstractAction persons() {
        return new MDDOpenCRUDAction(Person.class);
    }

    @Action(order = 3)
    public String md5(String s) {
        return Helper.md5(s);
    }

    @Action(order = 4)
    public String getThreadName() {
        return Thread.currentThread().getName();
    }

    @Action(order = 5)
    public String ls() throws IOException {
        return Helper.toHtml(Helper.runCommand("ls -lh"));
    }


    @Action(order = 6)
    public String df() throws IOException {
        return Helper.toHtml(Helper.runCommand("df -h"));
    }

}