package com.example.demoremote;

import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import org.springframework.stereotype.Component;

@MateuUI(path = "")
@Component
public class DemoApp implements Runnable {

    @MenuOption(icon = VaadinIcons.AIRPLANE)
    private BasicFieldsForm basicFields;


    @MenuOption(icon = VaadinIcons.EYE_SLASH)
    private MyReadOnlyPojo readOnlyPojo;

    @Submenu
    private ExplorerSubmenu explorer;

    @Submenu("Some cruds")
    private CrudsSubmenu cruds;

    @Override
    public void run() {
        System.out.println("Hola");
    }

}