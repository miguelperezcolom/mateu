package io.mateu.mdd.specdrivengenerator.application.usecases.entity.create;

import io.mateu.mdd.specdrivengenerator.application.out.EntityRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.Entity;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateEntityUseCase {

    final EntityRepository repository;

    public void handle(CreateEntityCommand command) {
        var entity = Entity.of(new EntityId(command.id()), new EntityName(command.name()));
        repository.save(entity);
    }

}
