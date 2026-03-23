package io.mateu.mdd.specdrivengenerator.application.usecases.aggregate.save;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.shared.vo.Field;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SaveAggregateUseCase {

    final AggregateRepository repository;

    public void handle(SaveAggregateCommand command) {
        var role = repository.findById(new AggregateId(command.id())).orElseThrow();
        role.update(
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
                command.invariants()
        );
        repository.save(role);
    }

}
