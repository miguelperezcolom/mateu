package io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantName;
import lombok.Getter;

@Getter
public class Invariant {

    private InvariantId id;
    private InvariantName name;

    public static Invariant of(InvariantId id, InvariantName name) {
        var aggregate = new Invariant();
        aggregate.id = id;
        aggregate.name = name;
        return aggregate;
    }

    public void update(InvariantName name) {
        this.name = name;
    }
}
