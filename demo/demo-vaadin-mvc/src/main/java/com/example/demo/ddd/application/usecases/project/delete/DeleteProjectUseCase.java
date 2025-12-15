package com.example.demo.ddd.application.usecases.project.delete;

import com.example.demo.ddd.application.out.EventBus;
import com.example.demo.ddd.application.out.ProjectRepository;
import com.example.demo.ddd.domain.aggregates.project.Project;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DeleteProjectUseCase {

    final ProjectRepository projectRepository;
    final EventBus eventBus;

    public void handle(DeleteProjectCommand command) {
        var project = projectRepository.delete(
                projectRepository.findById(
                        new ProjectId(command.id()))
                        .delete());
        eventBus.sendAll(project.getEvents());
    }

}
