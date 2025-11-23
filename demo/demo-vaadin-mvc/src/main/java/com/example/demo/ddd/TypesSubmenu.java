package com.example.demo.ddd;

import com.example.demo.ddd.pages.project.Projects;
import com.example.demo.ddd.pages.project.enums.Enums;
import com.example.demo.ddd.pages.project.valueobjects.ValueObjects;
import io.mateu.uidl.annotations.Menu;

public class TypesSubmenu {

    @Menu
    ValueObjects valueObjects;

    @Menu
    Enums enums;


}
