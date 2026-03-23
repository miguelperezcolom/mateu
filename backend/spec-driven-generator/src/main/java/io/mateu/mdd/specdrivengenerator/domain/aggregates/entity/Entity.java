package io.mateu.mdd.specdrivengenerator.domain.aggregates.entity;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.entity.vo.EntityName;
import lombok.Getter;

@Getter
public class Entity {

    private EntityId id;
    private EntityName name;

    public static Entity of(EntityId id, EntityName name) {
        var entity = new Entity();
        entity.id = id;
        entity.name = name;
        return entity;
    }

    public static Entity load(String id, String name) {
        var entity = new Entity();
        entity.id = new EntityId(id);
        entity.name = new EntityName(name);
        return entity;
    }

    public void update(EntityName name) {
        this.name = name;
    }
}
