package com.example.demo.ddd.infra.in.ui.pages.project;

import io.mateu.dtos.ComponentDto;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.Trigger;
import io.mateu.uidl.annotations.TriggerType;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ColumnAction;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.NoFilters;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.data.UICommand;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.RouteHandler;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.Map;

import static io.mateu.core.domain.out.fragmentmapper.componentbased.mappers.ButtonComponentToDtoMapper.mapButtonToDto;

record ProjectRow1(String id, String name, ComponentDto action) {

    public ProjectRow1(String id, String name) {
        this(id, name, mapButtonToDto(Button.builder()
                .label("View")
                .actionId("view")
                .parameters(Map.of("id", id))
                .build()));
    }
}

record ProjectRow2(String id, String name, ColumnAction action) {

    public ProjectRow2(String id, String name) {
        this(id, name, ColumnAction.builder()
                .label("View")
                .methodNameInCrud("view")
                .build());
    }
}

@Service
@RequiredArgsConstructor
@Trigger(type = TriggerType.OnLoad, actionId = "search")
public class Projects implements ListingBackend<NoFilters, ProjectRow2>, RouteHandler {

    final ProjectCreationForm creationForm;
    final ProjectDetail detail;

    @Override
    public ListingData<ProjectRow2> search(String searchText, NoFilters noFilters, Pageable pageable, HttpRequest httpRequest) {
        return ListingData.of(new ProjectRow2("1", "Proyecto"));
    }

    @Toolbar
    @Label("New")
    ProjectCreationForm createNew() {
        return creationForm;
    }

    @Toolbar
    void delete() {
    }

    @Override
    public boolean supportsAction(String actionId) {
        if ("view".equals(actionId)) {
            return true;
        };
        return ListingBackend.super.supportsAction(actionId);
    }

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("view".equals(actionId)) {
            //return UICommand.navigateTo("projects/" + ((Map)httpRequest.getParameters(Map.class).get("_clickedRow")).get("id"));
            //return detail.load((String) ((Map)httpRequest.getParameters(Map.class).get("_clickedRow")).get("id"));
            return new URI( "projects/" + ((Map)httpRequest.getParameters(Map.class).get("_clickedRow")).get("id"));
        }
        return ListingBackend.super.handleAction(actionId, httpRequest);
    }

    public Object viewProject(ProjectRow2 row) {
        return detail;
    }

    @Override
    public Object handleRoute(String route, HttpRequest httpRequest) {
        if (!"".equals(route) && !route.endsWith("projects")) {
            var id = route.substring(route.indexOf("projects") + "projects".length() + 1).split("/")[0];
            return detail.load(id);
        }
        return this;
    }
}
