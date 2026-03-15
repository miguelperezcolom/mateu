package com.example.demo.infra.out.persistence;

import com.example.demo.infra.in.ui.pages.processes.Error;
import com.example.demo.infra.in.ui.pages.processes.Message;
import com.example.demo.infra.in.ui.pages.processes.Process;
import com.example.demo.infra.in.ui.pages.processes.Step;
import io.mateu.uidl.data.Status;
import io.mateu.uidl.data.StatusType;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class Populator {

    final ProcessCrudRepository processCrudRepository;
    final StepCrudRepository stepCrudRepository;
    final MessageCrudRepository messageCrudRepository;
    final ErrorCrudRepository errorCrudRepository;

    @PostConstruct
    void populate() {

        var process = new Process("1", "Despliegue web", new Status(StatusType.WARNING, "In progress"));
        processCrudRepository.save(process);

        stepCrudRepository.save(new Step("1", "s1", "Build", new Status(StatusType.SUCCESS, "Completed")));
        stepCrudRepository.save(new Step("1", "s2", "Deploy", new Status(StatusType.WARNING, "In progress")));


        messageCrudRepository.save(new Message("1", "m1", "Project has been built."));
        messageCrudRepository.save(new Message("1", "m2", "Project has been deployed."));

        errorCrudRepository.save(new Error("1", "e1", "Exception when notifying final status."));
    }


}
