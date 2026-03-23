package io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectName;
import lombok.Getter;

@Getter
public class ValueObject {

    private ValueObjectId id;
    private ValueObjectName name;

    public static ValueObject of(ValueObjectId id, ValueObjectName name) {
        var aggregate = new ValueObject();
        aggregate.id = id;
        aggregate.name = name;
        return aggregate;
    }

    public void update(ValueObjectName name) {
        this.name = name;
    }
}
