package com.example.demo;

import com.example.demo.crud1.Crud1;
import com.example.demo.crud1.Crud2;
import com.example.demo.crud1.Crud3;
import com.example.demo.crud1.Editor;
import com.example.demo.e2e.E2eMenu;
import com.example.demo.e2e.entities.PersonEntity;
import com.example.demo.formularios.Formulario1;
import com.vaadin.ui.Component;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.core.interfaces.HasFooter;
import io.mateu.mdd.shared.annotations.Caption;
import io.mateu.mdd.shared.annotations.MenuOption;
import io.mateu.mdd.shared.annotations.PublicHome;
import io.mateu.mdd.shared.annotations.Submenu;

@MateuUI(path = "",
        favIcon = "https://www.wefox.com/favicons/favicon-32x32.png",
        stylesheets = "estilo.css")
@Caption("Demo")
public class MyUI implements HasFooter {

    @PublicHome
    private String home = "Hello world!";

    @MenuOption
    private Crud1 crud1;

    @MenuOption
    private Crud2 crud2;

    @MenuOption
    private Crud3 crud3;

    @MenuOption
    private Formulario1 formulario1;

    @MenuOption
    private Editor editor;

    @Submenu
    private Menu submenu;

    @MenuOption
    public Class prsonas = PersonEntity.class;

    @Submenu(value = "E2E")
    private E2eMenu e2e;

    @Override
    public Component getFooterComponent() {
        return new Footer();
    }

}
