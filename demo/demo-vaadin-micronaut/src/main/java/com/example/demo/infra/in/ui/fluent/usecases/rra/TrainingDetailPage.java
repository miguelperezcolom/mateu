package com.example.demo.infra.in.ui.fluent.usecases.rra;

import com.example.demo.domain.Training;
import com.example.demo.domain.TrainingRepository;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.AccordionLayout;
import io.mateu.uidl.data.AccordionPanel;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.data.ProgressBar;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Inject;
import jakarta.inject.Singleton;

import java.util.List;

@Route("/fluent-app/use-cases/rra/trainings/.*")
@Singleton
public class TrainingDetailPage implements ComponentTreeSupplier, HasPostHydrationMethod {

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
        return Form.builder()
                .title(training.name())
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
                                                                        .runnable(() -> {
                                                                            System.out.println("Hola!!!");
                                                                        })
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
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        trainingId = httpRequest.lastPathItem();
        training = trainingRepository.findById(trainingId).get();
    }
}
