package io.mateu.mdd.specdrivengenerator.domain.aggregates.project;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import lombok.Getter;

@Getter
public class Project {

    private ProjectId id;
    private ProjectName name;

    public static Project of(ProjectId id, ProjectName name) {
        var project = new Project();
        project.id = id;
        project.name = name;
        return project;
    }

    public static Project load(String id, String name) {
        var project = new Project();
        project.id = new ProjectId(id);
        project.name = new ProjectName(name);
        return project;
    }

    public void update(ProjectName name) {
        this.name = name;
    }
}
