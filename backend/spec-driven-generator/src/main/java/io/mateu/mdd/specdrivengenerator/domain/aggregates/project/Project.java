package io.mateu.mdd.specdrivengenerator.domain.aggregates.project;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import lombok.Getter;

import java.util.List;

@Getter
public class Project {

    private ProjectId id;
    private ProjectName name;
    private List<ModuleId> modules;

    public static Project of(ProjectId id, ProjectName name, List<ModuleId> modules) {
        var project = new Project();
        project.id = id;
        project.name = name;
        project.modules = modules;
        return project;
    }

    public static Project load(String id, String name, List<String> modules) {
        var project = new Project();
        project.id = new ProjectId(id);
        project.name = new ProjectName(name);
        project.modules = modules.stream().map(ModuleId::new).toList();
        return project;
    }

    public void update(ProjectName name, List<ModuleId> modules) {
        this.name = name;
        this.modules = modules;
    }
}
