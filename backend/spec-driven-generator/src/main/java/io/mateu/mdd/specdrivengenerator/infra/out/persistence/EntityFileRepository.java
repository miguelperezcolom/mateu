package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.AggregateRepository;
import io.mateu.mdd.specdrivengenerator.application.out.EntityRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.Entity;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.AggregateEntity;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.CommonFileRepository;
import io.mateu.mdd.specdrivengenerator.infra.out.persistence.file.EntityEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EntityFileRepository implements EntityRepository {

    final CommonFileRepository repository;

    @Override
    public Optional<Entity> findById(EntityId id) {
        return repository.findById(id.id(), EntityEntity.class)
                .map(entity -> Entity.load(entity.id(), entity.name()));
    }

    @Override
    public Entity save(Entity entity) {
        repository.save(new EntityEntity(entity.getId().id(), entity.getName().name()));
        return entity;
    }

    @Override
    public void deleteAllById(List<EntityId> selectedIds) {
        repository.deleteAllById(selectedIds.stream().map(EntityId::id).toList());
    }
}
