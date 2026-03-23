package io.mateu.mdd.specdrivengenerator.application.usecases.entity.delete;

import io.mateu.mdd.specdrivengenerator.application.out.EntityRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteEntityUseCase {

    final EntityRepository repository;

    public void handle(DeleteEntityCommand command) {
        repository.deleteAllById(command.ids().stream().map(EntityId::new).toList());
    }

}
