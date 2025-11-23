package com.example.demo.ddd.pages.project;

import com.example.demo.ddd.TypesSubmenu;
import com.example.demo.ddd.pages.project.aggregates.Aggregates;
import com.example.demo.ddd.pages.project.decisions.Decisions;
import com.example.demo.ddd.pages.project.workflows.Workflows;
import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Menu;
import org.springframework.stereotype.Service;

@Service
@HomeRoute("/aggregates")
public class ProjectApp {

    @Menu
    TypesSubmenu types;

    @Menu
    Aggregates aggregates;

    @Menu
    Decisions decisions;

    @Menu
    Workflows workflows;

    public ProjectApp load(String id) {
        return this;
    }

}
