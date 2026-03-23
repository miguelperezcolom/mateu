package io.mateu.mdd.specdrivengenerator.application.out;

import io.mateu.mdd.specdrivengenerator.application.shared.Repository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.ValueObject;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.valueobject.vo.ValueObjectId;

public interface ValueObjectRepository extends Repository<ValueObject, ValueObjectId> {
}
