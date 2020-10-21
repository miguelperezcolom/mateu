package org.example.application.ui;

import com.vaadin.ui.themes.ValoTheme;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Action;

@MateuUI(path = "/badform")
public class BadForm {

    String name;

    int age;

    @Action(style = ValoTheme.BUTTON_PRIMARY)
    public String process() {
        return "Processed. Thanks, " + name + ".";
    }

    @Action
    public String doOtherThing() {
        return "Other thing done. Thanks, " + name + ".";
    }

    @Action(style = ValoTheme.BUTTON_DANGER)
    public String doABadThing() {
        return "Bad thing done. Thanks, " + name + ".";
    }

}
