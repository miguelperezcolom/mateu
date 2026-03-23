package io.mateu.mdd.specdrivengenerator.application.usecases.project.create;

import io.mateu.mdd.specdrivengenerator.application.out.ProjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.Project;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectOutputPath;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectPackageName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateProjectUseCase {

    final ProjectRepository repository;

    public void handle(CreateProjectCommand command) {
        var project = Project.of(new ProjectId(command.id()),
                new ProjectName(command.name()),
                new ProjectOutputPath(command.outputPath()),
                new ProjectPackageName(command.packageName()),
                command.moduleIds().stream().map(ModuleId::new).toList());
        repository.save(project);
    }

}
