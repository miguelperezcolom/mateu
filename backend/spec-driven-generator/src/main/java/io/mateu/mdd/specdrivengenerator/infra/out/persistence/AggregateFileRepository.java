package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.AggregateEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
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
                .map(entity -> Aggregate.load(entity.id(), entity.name()));
    }

    @Override
    public Aggregate save(Aggregate entity) {
        repository.save(new AggregateEntity(entity.getId().id(), entity.getName().name(), List.of(), List.of(), List.of()));
        return entity;
    }

    @Override
    public void deleteAllById(List<AggregateId> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(AggregateId::id).toList());
    }
}
