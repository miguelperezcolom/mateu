package com.example.demo.ddd.application.usecases.project.list;

import com.example.demo.ddd.application.out.EventBus;
import com.example.demo.ddd.application.out.ProjectRepository;
import com.example.demo.ddd.domain.aggregates.project.Project;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectId;
import com.example.demo.ddd.domain.aggregates.project.valueobjects.ProjectName;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ListProjectsUseCase {

    final ProjectRepository projectRepository;

    public List<Project> handle(ListProjectsCommand command) {
        return projectRepository.findAll();
    }

}
