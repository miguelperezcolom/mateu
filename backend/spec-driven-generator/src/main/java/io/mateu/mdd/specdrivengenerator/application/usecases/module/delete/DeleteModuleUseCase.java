package io.mateu.mdd.specdrivengenerator.application.usecases.module.delete;

import io.mateu.mdd.specdrivengenerator.application.out.ModuleRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteModuleUseCase {

    final ModuleRepository repository;

    public void handle(DeleteModuleCommand command) {
        repository.deleteAllById(command.ids().stream().map(ModuleId::new).toList());
    }

}
