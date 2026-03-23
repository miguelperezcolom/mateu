package io.mateu.mdd.specdrivengenerator.application.query;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ValueObjectRow;
import io.mateu.mdd.specdrivengenerator.application.shared.QueryService;

public interface ValueObjectQueryService extends QueryService<ValueObjectDto, ValueObjectRow, String> {
}
