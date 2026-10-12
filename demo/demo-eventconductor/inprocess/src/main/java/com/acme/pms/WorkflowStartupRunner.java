package com.acme.pms;

import io.mateu.workflow.dtos.Variable;
import io.mateu.workflow.dtos.events.integration.ProcessCreationRequested;
import io.mateu.workflow.infra.in.async.processupstreamevent.ProcessUpstreamEventCommand;
import io.mateu.workflow.infra.in.async.processupstreamevent.ProcessUpstreamEventUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class WorkflowStartupRunner implements ApplicationRunner {

    final ProcessUpstreamEventUseCase processUpstreamEventUseCase;

    @Override
    public void run(ApplicationArguments args) {
        processUpstreamEventUseCase.handle(new ProcessUpstreamEventCommand(
            new ProcessCreationRequested(
                "hello-world",
                "my-first-process",
                List.of(new Variable("name", "Alice"))
            )
        ));
    }

}
