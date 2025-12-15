package com.example.demo.ddd.domain.aggregates.project;

import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectName;
import com.example.demo.ddd.domain.shared.AggregateRoot;

public class Project extends AggregateRoot {

    ProjectId id;

    ProjectName name;

    boolean deleted;

    public static Project create(ProjectId id, ProjectName name) {
        var project = load(id, name);
        project.send(new ProjectCreated(id));
        return project;
    }

    public static Project load(ProjectId id, ProjectName name) {
        var project = new Project();
        project.id = id;
        project.name = name;
        return project;
    }

    public Project delete() {
        if (deleted) {
            return this;
        }
        deleted = true;
        send(new ProjectDeleted(id));
        return this;
    }

    public Project update(ProjectName name) {
        this.name = name;
        send(new ProjectDeleted(id));
        return this;
    }
}
