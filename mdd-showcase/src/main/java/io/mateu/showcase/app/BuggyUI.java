package io.mateu.showcase.app;

import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.util.Helper;

@MateuUI(path = "/buggy")
public class BuggyUI {
    @MenuOption
    public String md5(String s) {
        System.out.println("md5(" + s + ")");
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

    @MenuOption
    Comando comando;

    @MenuOption
    Comando2 comando2;

}