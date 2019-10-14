package $

import io.mateu.mdd.core.annotations.Action;
import io.mateu.mdd.core.app.SimpleMDDApplication;
import io.mateu.mdd.core.util.Helper;

{package};
        {package}.model.Person;

public class MyApp extends SimpleMDDApplication {

    @Action(value = "Say hello", order = 1)
    public String hello(String name) {
        return "Hello " + name + "!";
    }


    @Action(order = 2)
    public Class people() {
        return Person.class;
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
    public String ls() throws Exception {
        return Helper.toHtml(Helper.runCommand("ls -lh"));
    }


    @Action(order = 6)
    public String df() throws Exception {
        return Helper.toHtml(Helper.runCommand("df -h"));
    }

}