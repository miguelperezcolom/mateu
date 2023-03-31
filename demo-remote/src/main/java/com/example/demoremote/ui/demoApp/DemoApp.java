package com.example.demoremote.ui.demoApp;

import com.example.demoremote.ui.demoApp.firstLevelStuff.BasicFieldsForm;
import com.example.demoremote.ui.demoApp.firstLevelStuff.MyReadOnlyPojo;
import com.example.demoremote.ui.demoApp.firstLevelStuff.MyReadOnlyPojoWithCrud;
import com.example.demoremote.ui.demoApp.menus.CrudsSubmenu;
import com.example.demoremote.ui.demoApp.menus.ExplorerSubmenu;
import com.example.demoremote.ui.demoApp.menus.SWSubmenu;
import com.vaadin.icons.VaadinIcons;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import org.springframework.stereotype.Component;

@MateuUI(path = "")
@Component
@Caption("This is a demo")
public class DemoApp implements Runnable {

    @MenuOption(icon = VaadinIcons.AIRPLANE)
    private BasicFieldsForm basicFields;


    @MenuOption(icon = VaadinIcons.EYE_SLASH)
    private MyReadOnlyPojo readOnlyPojo;

    @MenuOption(icon = VaadinIcons.EYE_SLASH)
    private MyReadOnlyPojoWithCrud readOnlyPojoWithCrud;

    @Submenu
    private ExplorerSubmenu explorer;

    @Submenu("Some cruds")
    private CrudsSubmenu cruds;

    @Submenu("Star Wars")
    private SWSubmenu sw;

    @Override
    public void run() {
        System.out.println("Hola");
    }

}
