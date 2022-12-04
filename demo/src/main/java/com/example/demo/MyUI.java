package com.example.demo;

import com.example.demo.crud1.Crud1;
import com.example.demo.crud1.Crud2;
import com.example.demo.formularios.Formulario1;
import io.mateu.mdd.core.annotations.MateuUI;
import io.mateu.mdd.shared.annotations.MenuOption;

@MateuUI(path = "",
        favIcon = "https://www.wefox.com/favicons/favicon-32x32.png",
        logo = "https://www.wefox.com/favicons/favicon-32x32.png",
        stylesheets = "estilo.css")
public class MyUI {

    @MenuOption
    private Crud1 crud1;

    @MenuOption
    private Crud2 crud2;

    @MenuOption
    private Formulario1 formulario1;

}
