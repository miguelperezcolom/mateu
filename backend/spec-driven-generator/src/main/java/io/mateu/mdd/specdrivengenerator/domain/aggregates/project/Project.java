package io.mateu.mdd.specdrivengenerator.domain.aggregates.project;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectOutputPath;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectPackageName;
import lombok.Getter;

import java.util.List;

@Getter
public class Project {

    private ProjectId id;
    private ProjectName name;
    private ProjectOutputPath outputPath;
    private ProjectPackageName packageName;
    private List<ModuleId> modules;

    public static Project of(ProjectId id,
                             ProjectName name,
                             ProjectOutputPath outputPath,
                             ProjectPackageName packageName,
                             List<ModuleId> modules) {
        var project = new Project();
        project.id = id;
        project.name = name;
        project.outputPath = outputPath;
        project.packageName = packageName;
        project.modules = modules;
        return project;
    }

    public static Project load(String id, String name, String outputPath, String packageName, List<String> modules) {
        var project = new Project();
        project.id = new ProjectId(id);
        project.name = new ProjectName(name);
        project.outputPath = new ProjectOutputPath(outputPath);
        project.packageName = new ProjectPackageName(packageName);
        project.modules = modules.stream().map(ModuleId::new).toList();
        return project;
    }

    public void update(ProjectName name, ProjectOutputPath outputPath, ProjectPackageName packageName, List<ModuleId> modules) {
        this.name = name;
        this.outputPath = outputPath;
        this.packageName = packageName;
        this.modules = modules;
    }
}
