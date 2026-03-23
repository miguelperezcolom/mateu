package io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.FieldDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.Invariant;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantName;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.shared.vo.Field;
import lombok.Getter;

import java.util.List;

@Getter
public class Aggregate {

    private AggregateId id;
    private AggregateName name;
    private List<Field> fields;
    private List<Invariant> invariants;

    public static Aggregate load(String id, String name, List<FieldDto> fields, List<InvariantDto> invariants) {
        var aggregate = new Aggregate();
        aggregate.id = new AggregateId(id);
        aggregate.name = new AggregateName(name);
        aggregate.fields = fields.stream().map(field -> new Field(
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
        )).toList();
        aggregate.invariants = invariants.stream()
                .map(invariant -> Invariant.of(new InvariantId(invariant.id()),
                        new InvariantName(invariant.name())))
                .toList();
        return aggregate;
    }

    public static Aggregate of(AggregateId id, AggregateName name, List<Field> fields, List<Invariant> invariants) {
        var aggregate = new Aggregate();
        aggregate.id = id;
        aggregate.name = name;
        aggregate.fields = fields;
        aggregate.invariants = invariants;
        return aggregate;
    }

    public void update(AggregateName name, List<Field> fields, List<InvariantDto> invariants) {
        this.name = name;
        this.fields = fields;
        this.invariants = invariants.stream()
                .map(invariant -> Invariant.of(new InvariantId(invariant.id()),
                        new InvariantName(invariant.name())))
                .toList();
    }
}
