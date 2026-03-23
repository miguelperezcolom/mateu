package io.mateu.mdd.specdrivengenerator.domain.aggregates.entity;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityName;
import lombok.Getter;

@Getter
public class Entity {

    private EntityId id;
    private EntityName name;

    public static Entity of(EntityId id, EntityName name) {
        var aggregate = new Entity();
        aggregate.id = id;
        aggregate.name = name;
        return aggregate;
    }

    public void update(EntityName name) {
        this.name = name;
    }
}
