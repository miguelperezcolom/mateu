package com.example.demo.ddd.pages;

import com.example.demo.ddd.TypesSubmenu;
import io.mateu.uidl.annotations.Menu;
import org.springframework.stereotype.Service;

@Service
public class ProjectApp {

    @Menu
    TypesSubmenu types;

    @Menu
    Projects aggregates;

    @Menu
    Projects decisions;

    @Menu
    Projects workflows;

    public ProjectApp load(String id) {
        return this;
    }

}
