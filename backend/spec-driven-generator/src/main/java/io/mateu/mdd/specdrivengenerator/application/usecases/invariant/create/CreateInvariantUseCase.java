package io.mateu.mdd.specdrivengenerator.application.usecases.invariant.create;

import io.mateu.mdd.specdrivengenerator.application.out.InvariantRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.Invariant;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateInvariantUseCase {

    final InvariantRepository repository;

    public void handle(CreateInvariantCommand command) {
        var invariant = Invariant.of(new InvariantId(command.id()), new InvariantName(command.name()));
        repository.save(invariant);
    }

}
