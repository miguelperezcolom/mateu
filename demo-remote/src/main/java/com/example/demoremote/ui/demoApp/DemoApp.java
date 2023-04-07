package com.example.demoremote.ui.demoApp;

import com.example.demoremote.ui.demoApp.menus.*;
import com.example.demoremote.ui.demoApp.menus.forms.BasicFieldsForm;
import com.example.demoremote.ui.demoApp.menus.forms.MyReadOnlyPojo;
import com.example.demoremote.ui.demoApp.menus.forms.MyReadOnlyPojoWithCrud;
import io.mateu.mdd.shared.annotations.*;
import org.springframework.stereotype.Component;

@Component
@Caption("This is a demo")
@MateuUI("")
@ExternalScripts("https://ajax.googleapis.com/ajax/libs/model-viewer/3.0.1/model-viewer.min.js")
public class DemoApp implements Runnable {

    @MenuOption
    private BasicFieldsForm basicFields;

    @Submenu
    private FormsSubmenu forms;

    @Submenu
    private CollectionsSubmenu collections;

    @Submenu
    private RefsSubmenu refs;

    @Submenu("Some cruds")
    private CrudsSubmenu cruds;

    @Submenu("NFL")
    private NFLSubmenu nfl;

    @Submenu("Star Wars")
    private SWSubmenu sw;

    @MenuOption
    @Private
    private BasicFieldsForm eyesOnly;


    @Override
    public void run() {
        System.out.println("Hola");
    }

}
