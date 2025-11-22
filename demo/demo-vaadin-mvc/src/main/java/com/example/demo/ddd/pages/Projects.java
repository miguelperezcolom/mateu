package com.example.demo.ddd.pages;

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
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ListingBackend;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
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
public class Projects implements ListingBackend<NoFilters, ProjectRow2> {

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

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("view".equals(actionId)) {
            return detail.load((String) ((Map)httpRequest.getParameters(Map.class).get("_clickedRow")).get("id"));
        }
        return ListingBackend.super.handleAction(actionId, httpRequest);
    }

    public Object viewProject(ProjectRow2 row) {
        return detail;
    }
}
