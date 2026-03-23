package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.EntityRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.Entity;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EntityFileRepository implements EntityRepository {
    @Override
    public Optional<Entity> findById(EntityId id) {
        return Optional.empty();
    }

    @Override
    public EntityId save(Entity entity) {
        return null;
    }

    @Override
    public void deleteAllById(List<EntityId> selectedIds) {

    }
}
