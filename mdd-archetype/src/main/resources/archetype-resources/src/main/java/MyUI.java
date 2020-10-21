package ${package};

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.*;
import io.mateu.util.Helper;

import ${package}.model.Person;

@MateuUI(path = "")
public class MyUI {

    @MenuOption
    Class people = Person.class;

    @MenuOption
    public String md5(String s) {
        return Helper.md5(s);
    }

    @MenuOption
    public String getThreadName() {
        return Thread.currentThread().getName();
    }

    @MenuOption
    public String ls() throws Exception {
        return Helper.toHtml(Helper.runCommand("ls -lh"));
    }


    @MenuOption
    public String df() throws Exception {
        return Helper.toHtml(Helper.runCommand("df -h"));
    }

}