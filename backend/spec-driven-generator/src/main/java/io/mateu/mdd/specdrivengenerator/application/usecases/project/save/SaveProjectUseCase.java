package io.mateu.mdd.specdrivengenerator.application.usecases.project.save;

import io.mateu.mdd.specdrivengenerator.application.out.ProjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveProjectUseCase {

    final ProjectRepository repository;

    public void handle(SaveProjectCommand command) {
        var role = repository.findById(new ProjectId(command.id())).orElseThrow();
        role.update(new ProjectName(command.name()), command.moduleIds().stream().map(ModuleId::new).toList());
        repository.save(role);
    }

}
