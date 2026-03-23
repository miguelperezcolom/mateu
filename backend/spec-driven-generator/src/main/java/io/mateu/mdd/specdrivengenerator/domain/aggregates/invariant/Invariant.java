package io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.invariant.vo.InvariantName;
import lombok.Getter;

@Getter
public class Invariant {

    private InvariantId id;
    private InvariantName name;

    public static Invariant of(InvariantId id, InvariantName name) {
        var invariant = new Invariant();
        invariant.id = id;
        invariant.name = name;
        return invariant;
    }

    public static Invariant load(String id, String name) {
        var invariant = new Invariant();
        invariant.id = new InvariantId(id);
        invariant.name = new InvariantName(name);
        return invariant;
    }

    public void update(InvariantName name) {
        this.name = name;
    }
}
