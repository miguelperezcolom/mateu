package io.mateu.mdd.specdrivengenerator.application.out;

import io.mateu.mdd.specdrivengenerator.application.shared.Repository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.Project;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;

public interface ProjectRepository extends Repository<Project, ProjectId> {
}
