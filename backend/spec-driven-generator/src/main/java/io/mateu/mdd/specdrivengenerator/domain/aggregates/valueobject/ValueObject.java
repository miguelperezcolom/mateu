package io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject;

import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectName;
import lombok.Getter;

@Getter
public class ValueObject {

    private ValueObjectId id;
    private ValueObjectName name;

    public static ValueObject of(ValueObjectId id, ValueObjectName name) {
        var valueObject = new ValueObject();
        valueObject.id = id;
        valueObject.name = name;
        return valueObject;
    }

    public static ValueObject load(String id, String name) {
        var valueObject = new ValueObject();
        valueObject.id = new ValueObjectId(id);
        valueObject.name = new ValueObjectName(name);
        return valueObject;
    }

    public void update(ValueObjectName name) {
        this.name = name;
    }
}
