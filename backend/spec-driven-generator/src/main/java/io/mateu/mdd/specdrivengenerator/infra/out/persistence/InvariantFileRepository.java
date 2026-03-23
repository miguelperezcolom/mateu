package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.EntityRepository;
import io.mateu.mdd.specdrivengenerator.application.out.InvariantRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.Entity;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.Invariant;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.EntityEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.InvariantEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class InvariantFileRepository implements InvariantRepository {

    final CommonFileRepository repository;

    @Override
    public Optional<Invariant> findById(InvariantId id) {
        return repository.findById(id.id(), InvariantEntity.class)
                .map(entity -> Invariant.load(entity.id(), entity.name()));
    }

    @Override
    public Invariant save(Invariant entity) {
        repository.save(new InvariantEntity(entity.getId().id(), entity.getName().name()));
        return entity;
    }

    @Override
    public void deleteAllById(List<InvariantId> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(InvariantId::id).toList());
    }
}
