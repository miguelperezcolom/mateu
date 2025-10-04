package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HandlesActions;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;

import java.util.List;

@Route("/fluent-app/rules/run-action")
public class RunActionRulePage implements ComponentTreeSupplier, RuleSupplier, HandlesActions {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Run action rule")
                .content(List.of(
                        FormField.builder()
                                .id("trigger")
                                .dataType(FieldDataType.bool)
                                .label("Check/uncheck to trigger action")
                                .build()
                ))
                .build();
    }

    @Override
    public List<Rule> rules() {
        return List.of(
                Rule.builder()
                        .filter("true")
                        .action(RuleAction.RunAction)
                        .fieldName("texto")
                        .actionId("action_id")
                        .result(RuleResult.Continue)
                        .build()
        );
    }

    @Override
    public Object handleAction(String actionId, HttpRequest httpRequest) {
        return Message.builder().text("actionId: " + actionId).build();
    }
}
