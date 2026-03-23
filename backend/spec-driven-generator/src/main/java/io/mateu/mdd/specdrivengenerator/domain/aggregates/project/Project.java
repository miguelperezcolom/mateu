package io.mateu.mdd.specdrivengenerator.domain.aggregates.project;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import lombok.Getter;

@Getter
public class Project {

    private ProjectId id;
    private ProjectName name;

    public static Project of(ProjectId id, ProjectName name) {
        var aggregate = new Project();
        aggregate.id = id;
        aggregate.name = name;
        return aggregate;
    }

    public void update(ProjectName name) {
        this.name = name;
    }
}
