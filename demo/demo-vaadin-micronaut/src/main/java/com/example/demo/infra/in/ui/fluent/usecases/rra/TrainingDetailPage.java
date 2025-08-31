package com.example.demo.infra.in.ui.fluent.usecases.rra;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.FormLayout;
import io.mateu.uidl.data.FormRow;
import io.mateu.uidl.data.FormSection;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HasPostHydrationMethod;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.inject.Singleton;

import java.util.List;

@Route("/fluent-app/use-cases/rra/trainings/.*")
@Singleton
public class TrainingDetailPage implements ComponentTreeSupplier, HasPostHydrationMethod {

    String trainingId;

    @Override
    public Component component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Training " + trainingId)
                .build();
    }

    @Override
    public void onHydrated(HttpRequest httpRequest) {
        trainingId = httpRequest.lastPathItem();
    }
}
