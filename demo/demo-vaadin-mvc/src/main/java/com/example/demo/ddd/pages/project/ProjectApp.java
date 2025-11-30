package com.example.demo.ddd.pages.project;

import com.example.demo.ddd.TypesSubmenu;
import com.example.demo.ddd.pages.project.aggregates.Aggregates;
import com.example.demo.ddd.pages.project.decisions.Decisions;
import com.example.demo.ddd.pages.project.workflows.Workflows;
import io.mateu.uidl.annotations.BaseRoute;
import io.mateu.uidl.annotations.HomeRoute;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.RouteLink;
import io.mateu.uidl.interfaces.HomeRouteSupplier;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@BaseRoute("/projects/[^/]+$")
public class ProjectApp implements HomeRouteSupplier {

    String id;

    @Menu
    TypesSubmenu types;

    @Menu
    String aggregates;

    @Menu
    String decisions;

    @Menu
    String workflows;

    public ProjectApp load(String id) {
        this.id = id;
        return this;
    }

    @Override
    public String homeRoute() {
        return "/projects/" + id + "/aggregates";
    }
}
