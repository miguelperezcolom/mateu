package com.example.demo.ddd.application.usecases.project.create;

import com.example.demo.ddd.application.out.EventBus;
import com.example.demo.ddd.application.out.ProjectRepository;
import com.example.demo.ddd.domain.aggregates.project.Project;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CreateProjectUseCase {

    final ProjectRepository projectRepository;
    final EventBus eventBus;

    public void handle(CreateProjectCommand command) {
        var project = Project.create(new ProjectId(command.id()), new ProjectName(command.name()));
        projectRepository.save(project);
        eventBus.sendAll(project.getEvents());
    }

}
