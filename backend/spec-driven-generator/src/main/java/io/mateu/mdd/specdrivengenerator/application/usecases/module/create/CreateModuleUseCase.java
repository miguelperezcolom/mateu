package io.mateu.mdd.specdrivengenerator.application.usecases.module.create;

import io.mateu.mdd.specdrivengenerator.application.out.ModuleRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.Module;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.module.vo.ModuleName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateModuleUseCase {

    final ModuleRepository repository;

    public void handle(CreateModuleCommand command) {
        var module = Module.of(new ModuleId(command.id()), new ModuleName(command.name()), command.aggregates().stream().map(AggregateId::new).toList());
        repository.save(module);
    }

}
