package io.mateu.mdd.specdrivengenerator.application.out;

import io.mateu.mdd.specdrivengenerator.application.shared.Repository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.Aggregate;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.aggregate.vo.AggregateId;

public interface AggregateRepository extends Repository<Aggregate, AggregateId> {
}
