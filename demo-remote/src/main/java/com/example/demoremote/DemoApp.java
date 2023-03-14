package com.example.demoremote;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;

@MateuUI(path = "")
public class DemoApp implements Runnable {

    @MenuOption(icon = VaadinIcons.AIRPLANE)
    private BasicFieldsForm basicFields;

    @Submenu
    private ExplorerSubmenu explorer;

    @Submenu("NFL")
    private NflSubmenu nfl;

    @Override
    public void run() {
        System.out.println("Hola");
    }
}
