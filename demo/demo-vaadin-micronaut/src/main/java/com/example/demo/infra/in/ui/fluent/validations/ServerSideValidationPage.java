package com.example.demo.infra.in.ui.fluent.validations;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.NotificationVariant;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.ActionHandler;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.Validation;
import jakarta.validation.ValidationException;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.stream.Collectors;

@Route("/fluent-app/validations/server-side")
public class ServerSideValidationPage implements ComponentTreeSupplier, ActionHandler {

    @NotEmpty
    String name;


    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Server-side validation")
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
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        Validator validator = factory.getValidator();
        var errors = validator.validate(this);
        if (!errors.isEmpty()) {
            var message = errors.stream().map(constraintViolation -> constraintViolation.getMessage()).collect(Collectors.joining());
            throw new ValidationException(message);
        }
        return Message.builder()
                .variant(NotificationVariant.success)
                .text("passed")
                .build();
    }
}
