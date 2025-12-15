package com.example.demo.ddd.application.usecases.project.update;

import com.example.demo.ddd.application.out.EventBus;
import com.example.demo.ddd.application.out.ProjectRepository;
import com.example.demo.ddd.domain.aggregates.project.Project;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UpdateProjectUseCase {

    final ProjectRepository projectRepository;
    final EventBus eventBus;

    public void handle(UpdateProjectCommand command) {
        var project = projectRepository.delete(
                projectRepository.findById(
                                new ProjectId(command.id()))
                        .update(new ProjectName(command.name())));
        eventBus.sendAll(project.getEvents());
    }

}
