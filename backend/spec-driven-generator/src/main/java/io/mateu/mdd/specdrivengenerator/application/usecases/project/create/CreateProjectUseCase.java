package io.mateu.mdd.specdrivengenerator.application.usecases.project.create;

import io.mateu.mdd.specdrivengenerator.application.out.ProjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.Project;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateProjectUseCase {

    final ProjectRepository repository;

    public void handle(CreateProjectCommand command) {
        var project = Project.of(new ProjectId(command.id()), new ProjectName(command.name()));
        repository.save(project);
    }

}
