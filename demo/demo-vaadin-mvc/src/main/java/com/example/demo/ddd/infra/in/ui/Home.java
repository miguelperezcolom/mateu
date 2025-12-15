package com.example.demo.ddd.infra.in.ui;

import com.example.demo.ddd.infra.in.ui.pages.project.Projects;
import io.mateu.uidl.annotations.MateuUI;
import io.mateu.uidl.annotations.Menu;

@MateuUI("")
public class Home {

    @Menu
    Projects projects;



    String content = "Hola!";

}
