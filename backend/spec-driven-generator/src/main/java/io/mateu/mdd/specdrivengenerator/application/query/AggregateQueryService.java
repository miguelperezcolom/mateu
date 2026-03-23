package io.mateu.mdd.specdrivengenerator.application.query;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.AggregateRow;
import io.mateu.mdd.specdrivengenerator.application.shared.QueryService;

public interface AggregateQueryService extends QueryService<AggregateDto, AggregateRow, String> {
}
