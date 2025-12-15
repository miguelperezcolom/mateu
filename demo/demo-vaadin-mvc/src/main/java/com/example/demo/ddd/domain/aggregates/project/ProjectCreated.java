package com.example.demo.ddd.domain.aggregates.project;

import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.shared.DomainEvent;

public record ProjectCreated(ProjectId id) implements DomainEvent {
}
