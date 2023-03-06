package com.example.demoremote;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;

@MateuUI(path = "")
public class DemoApp {

    @MenuOption(icon = VaadinIcons.AIRPLANE)
    private MyForm myForm;

    @MenuOption
    private MyForm myFormAgain;

    @Submenu("NFL")
    private NflSubmenu nfl;

}
