package com.example.demo.infra.in.ui.fluent.actions;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.MaxValidation;
import io.mateu.uidl.data.MinValidation;
import io.mateu.uidl.data.PatternValidation;
import io.mateu.uidl.data.State;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.ConfirmationTexts;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.HasActions;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.SneakyThrows;

import java.util.List;
import java.util.Map;

@Route("/fluent-app/actions/validation-required")
public class ValidationRequiredActionPage implements ComponentTreeSupplier, HasActions, HandlesActions {

    @Override
    public Form getComponent(HttpRequest httpRequest) {
        return Form.builder()
                .title("Validation required")
                .content(List.of(
                        VerticalLayout.builder()
                                .content(List.of(

                                        Text.builder()
                                                .text("${state.count}")
                                                .build(),

                                        FormField.builder()
                                                .id("name")
                                                .dataType(FieldDataType.string)
                                                .label("Name")
                                                .required(true)
                                                .build(),

                                        FormField.builder()
                                                .id("nickname")
                                                .dataType(FieldDataType.string)
                                                .label("Nick name")
                                                .description("Pattern")
                                                .validations(List.of(
                                                        new PatternValidation("[a-zA-Z]*", "Only characters are allowed")
                                                ))
                                                .build(),

                                        FormField.builder()
                                                .id("age")
                                                .dataType(FieldDataType.integer)
                                                .label("Age")
                                                .validations(List.of(
                                                        new MinValidation(0, "Must be greater than or equal to 0"),
                                                        new MaxValidation(120, "Must be less than 121")
                                                ))
                                                .build(),

                                        Button.builder()
                                                .actionId("action")
                                                .label("Count")
                                                .build()
                                ))
                                .spacing(true)
                                .build()
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(Action.builder()
                .id("action")
                .validationRequired(true)
                .build());
    }

    @SneakyThrows
    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return new State(Map.of("count", httpRequest.getInt("count") + 1));
    }
}
