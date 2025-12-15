package com.example.demo.ddd.application.out;

import com.example.demo.ddd.domain.aggregates.project.Project;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.shared.AggregateRepository;

public interface ProjectRepository extends AggregateRepository<Project, ProjectId> {
}
