package io.mateu.mdd.specdrivengenerator.application.query;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.EntityRow;
import io.mateu.mdd.specdrivengenerator.application.shared.QueryService;

public interface EntityQueryService extends QueryService<EntityDto, EntityRow, String> {
}
