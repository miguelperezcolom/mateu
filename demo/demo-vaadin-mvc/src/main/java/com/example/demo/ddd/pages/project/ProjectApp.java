package com.example.demo.ddd.pages.project;

import com.example.demo.ddd.TypesSubmenu;
import com.example.demo.ddd.pages.project.aggregates.Aggregates;
import com.example.demo.ddd.pages.project.decisions.Decisions;
import com.example.demo.ddd.pages.project.workflows.Workflows;
import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.data.RouteLink;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@HomeRoute("/aggregates")
@RequiredArgsConstructor
public class ProjectApp {

    final Aggregates _aggregates;

    String id;

    @Menu
    TypesSubmenu types;

    @Menu
    Aggregates aggregates;

    @Menu
    RouteLink aggregates2;

    @Menu
    Decisions decisions;

    @Menu
    Workflows workflows;

    public ProjectApp load(String id) {
        this.id = id;
        this.aggregates = _aggregates.load(id);
        this.aggregates2 = new RouteLink("/projects/" + id + "/aggregates");
        return this;
    }

}
