package io.mateu.mdd.specdrivengenerator.infra.out.persistence;

import io.mateu.mdd.specdrivengenerator.application.out.ProjectRepository;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.Project;
import io.mateu.mdd.specdrivengenerator.domain.aggregates.project.vo.ProjectId;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProjectFileRepository implements ProjectRepository {
    @Override
    public Optional<Project> findById(ProjectId id) {
        return Optional.empty();
    }

    @Override
    public ProjectId save(Project entity) {
        return null;
    }

    @Override
    public void deleteAllById(List<ProjectId> selectedIds) {

    }
}
