package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.FieldDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.shared.vo.Field;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.AggregateEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.InvariantEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AggregateFileRepository implements AggregateRepository {

    final CommonFileRepository repository;

    @Override
    public Optional<Aggregate> findById(AggregateId id) {
        return repository.findById(id.id(), AggregateEntity.class)
                .map(entity -> Aggregate.load(
                        entity.id(),
                        entity.name(),
                        entity.fields().stream().map(field -> new FieldDto(
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
                        entity.invariants().stream().map(invariantEntity -> new InvariantDto(
                                invariantEntity.id(),
                                invariantEntity.name()
                        )).toList()
                ));
    }

    @Override
    public Aggregate save(Aggregate entity) {
        repository.save(new AggregateEntity(entity.getId().id(), entity.getName().name(),
                entity.getFields().stream().map(field -> new Field(
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
                entity.getInvariants().stream()
                        .map(invariant -> new InvariantEntity(invariant.getId().id(), invariant.getName().name())).toList()));
        return entity;
    }

    @Override
    public void deleteAllById(List<AggregateId> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(AggregateId::id).toList());
    }
}
