package com.example.demo.ddd.infra.in.ui.project.pages.project;

import com.example.demo.ddd.infra.in.ui.project.TypesSubmenu;
import io.mateu.uidl.annotations.BaseRoute;
import io.mateu.uidl.annotations.Menu;
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
