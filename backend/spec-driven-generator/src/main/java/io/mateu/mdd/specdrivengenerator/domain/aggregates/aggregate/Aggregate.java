package io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateName;
import lombok.Getter;

@Getter
public class Aggregate {

    private AggregateId id;
    private AggregateName name;

    public static Aggregate load(String id, String name) {
        var aggregate = new Aggregate();
        aggregate.id = new AggregateId(id);
        aggregate.name = new AggregateName(name);
        return aggregate;
    }

    public static Aggregate of(AggregateId id, AggregateName name) {
        var aggregate = new Aggregate();
        aggregate.id = id;
        aggregate.name = name;
        return aggregate;
    }

    public void update(AggregateName name) {
        this.name = name;
    }
}
