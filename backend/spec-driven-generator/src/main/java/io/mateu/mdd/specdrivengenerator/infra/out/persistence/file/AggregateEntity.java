package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import io.mateu.uidl.interfaces.Identifiable;

import java.util.List;

public record AggregateEntity(
        String id,
        String name,
        List<ValueObjectEntity> valueObjects,
        List<EntityEntity> entities,
        List<InvariantEntity> invariants
        ) implements Identifiable {
}
