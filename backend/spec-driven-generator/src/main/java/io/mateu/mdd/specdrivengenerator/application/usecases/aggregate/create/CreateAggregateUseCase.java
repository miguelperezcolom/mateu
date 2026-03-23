package io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateAggregateUseCase {

    final AggregateRepository repository;

    public void handle(CreateAggregateCommand command) {
        var aggregate = Aggregate.of(new AggregateId(command.id()), new AggregateName(command.name()));
        repository.save(aggregate);
    }

}
