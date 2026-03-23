package io.mateu.mdd.specdrivengenerator.application.query;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ModuleRow;
import io.mateu.mdd.specdrivengenerator.application.shared.QueryService;

public interface ModuleQueryService extends QueryService<ModuleDto, ModuleRow, String> {
}
