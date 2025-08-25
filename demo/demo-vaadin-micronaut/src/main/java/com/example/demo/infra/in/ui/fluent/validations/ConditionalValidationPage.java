package com.example.demo.infra.in.ui.fluent.validations;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.data.Validation;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ValidationSupplier;

import java.util.List;

@Route("/fluent-app/validations/conditional")
public class ConditionalValidationPage implements ComponentTreeSupplier, ValidationSupplier, HandlesActions, HasActions {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Conditional validation")
                .content(List.of(
                        FormField.builder()
                                .id("name")
                                .dataType(FieldDataType.string)
                                .label("Name")
                                .required(true)
                                .build(),
                        FormField.builder()
                                .id("age")
                                .dataType(FieldDataType.integer)
                                .label("Age")
                                .build(),
                        Button.builder()
                                .actionId("xx")
                                .label("Validate")
                                .build()
                ))
                .build();
    }

    @Override
    public List<Validation> validations() {
        return List.of(
                Validation.builder()
                        .condition("!state.name || state.age > 0")
                        .fieldId("age")
                        .message("Age must be greater than 0 if you fill the name field.")
                        .build()

        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return Message.builder()
                .variant(NotificationVariant.success)
                .text("passed")
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("xx")
                        .validationRequired(true)
                        .build()
        );
    }
}
