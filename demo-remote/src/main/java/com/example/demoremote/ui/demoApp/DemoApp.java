package com.example.demoremote.ui.demoApp;

import com.example.demoremote.ui.demoApp.firstLevelStuff.BasicFieldsForm;
import com.example.demoremote.ui.demoApp.firstLevelStuff.MyReadOnlyPojo;
import com.example.demoremote.ui.demoApp.firstLevelStuff.MyReadOnlyPojoWithCrud;
import com.example.demoremote.ui.demoApp.menus.CrudsSubmenu;
import com.example.demoremote.ui.demoApp.menus.ExplorerSubmenu;
import com.example.demoremote.ui.demoApp.menus.SWSubmenu;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.Submenu;
import org.springframework.stereotype.Component;

@Component
@Caption("This is a demo")
@MateuUI("")
public class DemoApp implements Runnable {

    @MenuOption
    private BasicFieldsForm basicFields;


    @MenuOption
    private MyReadOnlyPojo readOnlyPojo;

    @MenuOption
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
