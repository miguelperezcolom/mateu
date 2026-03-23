package io.mateu.mdd.specdrivengenerator.application.out;

import io.mateu.mdd.specdrivengenerator.application.shared.Repository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.Entity;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;

public interface EntityRepository extends Repository<Entity, EntityId> {
}
