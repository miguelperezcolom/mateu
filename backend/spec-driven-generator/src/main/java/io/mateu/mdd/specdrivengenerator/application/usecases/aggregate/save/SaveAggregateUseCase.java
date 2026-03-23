package io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveAggregateUseCase {

    final AggregateRepository repository;

    public void handle(SaveAggregateCommand command) {
        var role = repository.findById(new AggregateId(command.id())).orElseThrow();
        role.update(new AggregateName(command.name()));
        repository.save(role);
    }

}
