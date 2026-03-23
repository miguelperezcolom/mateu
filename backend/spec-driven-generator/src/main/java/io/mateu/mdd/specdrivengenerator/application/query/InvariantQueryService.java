package io.mateu.mdd.specdrivengenerator.application.query;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.InvariantRow;
import io.mateu.mdd.specdrivengenerator.application.shared.QueryService;

public interface InvariantQueryService extends QueryService<InvariantDto, InvariantRow, String> {
}
