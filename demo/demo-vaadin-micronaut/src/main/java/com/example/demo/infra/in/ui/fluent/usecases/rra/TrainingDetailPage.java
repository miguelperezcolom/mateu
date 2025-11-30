package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Training;
import com.example.demo.domain.TrainingRepository;
import com.example.demo.domain.TrainingStep;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.ProgressBar;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.Page;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.PostHydrationHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Route(value="/use-cases/rra/trainings/.*", parentRoute="/use-cases/rra")
@Singleton
public class TrainingDetailPage implements ComponentTreeSupplier, PostHydrationHandler, ActionHandler {

    private final TrainingRepository trainingRepository;

    String trainingId;
    @JsonIgnore
    Training training;

    @Inject
    public TrainingDetailPage(TrainingRepository trainingRepository) {
        this.trainingRepository = trainingRepository;
    }

    @Override
    public Component component(HttpRequest httpRequest) {
        return Page.builder()
                .title(training.name())
                .content(List.of(Form.builder()
                        .header(List.of(ProgressBar.builder()
                                .min(0)
                                .max(training.totalSteps())
                                .value(training.completedSteps())
                                .text(training.completedSteps() + " of " + training.totalSteps() + " tasks completed")
                                .style("width: 100%;")
                                .build()))
                        .content(List.of(
                                AccordionLayout.builder()
                                        .panels(training.steps().stream().map(step ->
                                                        AccordionPanel.builder()
                                                                .label(step.name())
                                                                .content(VerticalLayout.builder()
                                                                        .content(List.of(
                                                                                new Text(step.text()),
                                                                                Button.builder()
                                                                                        .label("Mark as Complete")
                                                                                        .parameters(Map.of("stepId", step.id()))
                                                                                        .disabled(step.completed())
                                                                                        .build()
                                                                        ))
                                                                        .build())
                                                                .active(!step.completed())
                                                                .build()
                                                ).toList()
                                        )
                                        .build()
                        ))
                        .build()))
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        if ("".equals(httpRequest.runActionRq().actionId())) {
            trainingId = httpRequest.lastPathItem();
            training = trainingRepository.findById(trainingId).get();
        }
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        if ("markAsComplete".equals(actionId)) {
            String stepId = (String) httpRequest.getParameters(Map.class).get("stepId");
            training = trainingRepository.findById(trainingId).get();
            var steps = training.steps().stream()
                    .map(step -> step.id().equals(stepId)?
                            step.withCompleted(true).withCompletionDate(LocalDateTime.now())
                            :step)
                    .toList();
            training = trainingRepository.save(training
                    .withSteps(steps)
                    .withCompletedSteps( (int) steps.stream().filter(TrainingStep::completed).count()));
        }
        return this;
    }
}
