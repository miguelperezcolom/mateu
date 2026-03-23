package io.mateu.mdd.specdrivengenerator.application.usecases.entity.save;

import io.mateu.mdd.specdrivengenerator.application.out.EntityRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveEntityUseCase {

    final EntityRepository repository;

    public void handle(SaveEntityCommand command) {
        var role = repository.findById(new EntityId(command.id())).orElseThrow();
        role.update(new EntityName(command.name()));
        repository.save(role);
    }

}
