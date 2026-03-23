package io.mateu.mdd.specdrivengenerator.infra.out.persistence.file;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.shared.vo.Field;
import io.mateu.uidl.interfaces.Identifiable;

import java.util.List;

public record AggregateEntity(
        String id,
        String name,
        List<Field> fields,
        List<InvariantEntity> invariants
        ) implements Identifiable {
}
