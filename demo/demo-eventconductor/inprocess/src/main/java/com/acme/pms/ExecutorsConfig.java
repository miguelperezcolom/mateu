package com.acme.pms;

import io.mateu.workflow.application.out.EmbeddedTaskExecutor;
import io.mateu.workflow.application.usecases.stepexecution.update.UpdateStepExecutionCommand;
import io.mateu.workflow.application.usecases.stepexecution.update.UpdateStepExecutionUseCase;
import io.mateu.workflow.domain.aggregates.StepExecutionStatus;
import io.mateu.workflow.domain.aggregates.Variable;
import io.mateu.workflow.dtos.events.integration.TaskExecutionRequested;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * The single worker every ACTION is dispatched to, branching on the step id.
 *
 * <p>Deliberately not all green: the charge in {@code slow-saga} fails, so that process rolls back
 * and the UI has something worth looking at — a compensation drawn amber, an Errors tab with a
 * reason in it, and a process that ends COMPENSATED rather than COMPLETED.
 */
@Configuration
public class ExecutorsConfig {

    @Bean
    public EmbeddedTaskExecutor greetWorker(UpdateStepExecutionUseCase updateStepExecution) {
        return request -> {
            if ("charge".equals(request.stepId())) {
                fail(updateStepExecution, request);
            } else {
                greet(updateStepExecution, request);
            }
        };
    }

    private void greet(UpdateStepExecutionUseCase updateStepExecution, TaskExecutionRequested request) {
        String name = request.variables().stream()
                .filter(v -> "name".equals(v.name()))
                .map(v -> v.value())
                .findFirst().orElse("World");

        System.out.println("Hello, " + name + "! (" + request.stepId() + ")");

        updateStepExecution.handle(new UpdateStepExecutionCommand(
                request.taskExecutionId(),
                List.of(new Variable("greeting", "Hello, " + name + "!")),
                "",
                StepExecutionStatus.COMPLETED
        ));
    }

    /** Reported, not thrown: this is what a worker is supposed to do when the work fails. */
    private void fail(UpdateStepExecutionUseCase updateStepExecution, TaskExecutionRequested request) {
        updateStepExecution.handle(new UpdateStepExecutionCommand(
                request.taskExecutionId(),
                List.of(),
                "The card was declined (this testbench fails on purpose, so the rollback has "
                        + "something to undo)",
                StepExecutionStatus.ERROR
        ));
    }
}
