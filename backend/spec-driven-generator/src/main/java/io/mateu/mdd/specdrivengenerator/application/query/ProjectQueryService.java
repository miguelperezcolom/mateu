package io.mateu.mdd.specdrivengenerator.application.query;

import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectDto;
import io.mateu.mdd.specdrivengenerator.application.query.dtos.ProjectRow;
import io.mateu.mdd.specdrivengenerator.application.shared.QueryService;

public interface ProjectQueryService extends QueryService<ProjectDto, ProjectRow, String> {
}
