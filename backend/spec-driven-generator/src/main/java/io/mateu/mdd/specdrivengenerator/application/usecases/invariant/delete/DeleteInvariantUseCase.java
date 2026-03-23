package io.mateu.mdd.specdrivengenerator.application.usecases.invariant.delete;

import io.mateu.mdd.specdrivengenerator.application.out.InvariantRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteInvariantUseCase {

    final InvariantRepository repository;

    public void handle(DeleteInvariantCommand command) {
        repository.deleteAllById(command.ids().stream().map(InvariantId::new).toList());
    }

}
