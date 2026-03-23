package io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.create;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.Invariant;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.shared.vo.Field;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateAggregateUseCase {

    final AggregateRepository repository;

    public void handle(CreateAggregateCommand command) {
        var aggregate = Aggregate.of(
                new AggregateId(command.id()),
                new AggregateName(command.name()),
                command.fields().stream().map(field -> new Field(
                        field.name(),
                        field.label(),
                        field.type(),
                        field.help(),
                        field.valueObjectId(),
                        field.entityId(),
                        field.mandatory(),
                        field.readonly(),
                        field.visible(),
                        field.editable(),
                        field.searchable(),
                        field.filterable()
                )).toList(),
                command.invariants().stream()
                        .map(invariant ->
                                Invariant.of(new InvariantId(invariant.id()), new InvariantName(invariant.name())))
                        .toList()
        );
        repository.save(aggregate);
    }

}
