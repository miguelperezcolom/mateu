package com.example.demo.ddd.infra.out.persistence;

import com.example.demo.ddd.application.out.ProjectRepository;
import com.example.demo.ddd.domain.aggregates.project.Project;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;

import java.util.List;

public class LocalProjectRepository implements ProjectRepository {
    @Override
    public Project findById(ProjectId id) {
        return null;
    }

    @Override
    public Project save(Project aggregateRoot) {
        return null;
    }

    @Override
    public Project delete(Project aggregateRoot) {
        return null;
    }

    @Override
    public List<Project> findAll() {
        return List.of();
    }
}
