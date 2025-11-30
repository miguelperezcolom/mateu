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
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.ValidationSupplier;

import java.util.List;

@Route(value="/validations/required", parentRoute="^$")
public class RequiredValidationPage implements ComponentTreeSupplier, ValidationSupplier, ActionHandler, ActionSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Required validation")
                .content(List.of(
                        FormField.builder()
                                .id("name")
                                .dataType(FieldDataType.string)
                                .label("Name")
                                .required(true)
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
                        .condition("state.name")
                        .fieldId("name")
                        .message("Name is required")
                        .build(),
                Validation.builder()
                        .condition("state.name")
                        .fieldId("")
                        .message("Must be valid")
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
