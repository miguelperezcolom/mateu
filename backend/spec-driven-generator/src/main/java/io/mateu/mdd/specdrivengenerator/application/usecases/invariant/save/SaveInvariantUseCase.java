package io.mateu.mdd.specdrivengenerator.application.usecases.invariant.save;

import io.mateu.mdd.specdrivengenerator.application.out.InvariantRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveInvariantUseCase {

    final InvariantRepository repository;

    public void handle(SaveInvariantCommand command) {
        var role = repository.findById(new InvariantId(command.id())).orElseThrow();
        role.update(new InvariantName(command.name()));
        repository.save(role);
    }

}
