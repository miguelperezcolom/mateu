package io.mateu.mdd.specdrivengenerator.application.usecases.project.delete;

import io.mateu.mdd.specdrivengenerator.application.out.ProjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteProjectUseCase {

    final ProjectRepository repository;

    public void handle(DeleteProjectCommand command) {
        repository.deleteAllById(command.ids().stream().map(ProjectId::new).toList());
    }

}
