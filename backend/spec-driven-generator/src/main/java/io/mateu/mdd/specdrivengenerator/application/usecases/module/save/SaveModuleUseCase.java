package io.mateu.mdd.specdrivengenerator.application.usecases.module.save;

import io.mateu.mdd.specdrivengenerator.application.out.ModuleRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveModuleUseCase {

    final ModuleRepository repository;

    public void handle(SaveModuleCommand command) {
        var role = repository.findById(new ModuleId(command.id())).orElseThrow();
        role.update(new ModuleName(command.name()));
        repository.save(role);
    }

}
