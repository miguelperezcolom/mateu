package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.Button;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;

import java.util.List;

@Route("/fluent-app/rules/enabled")
public class EnabledRulePage implements ComponentTreeSupplier, RuleSupplier {

    boolean buttonDisabled = false;
    boolean fieldDisabled = false;

    @Override
    public Form component(HttpRequest httpRequest)  {
        return Form.builder()
                .title("Enabled rule")
                .content(List.of(
                        new Button("A Button"),
                        FormField.builder()
                                .id("aField")
                                .dataType(FieldDataType.string)
                                .label("A Field")
                                .build(),
                        FormField.builder()
                                .id("enable")
                                .dataType(FieldDataType.bool)
                                .label("Enable")
                                .build()
                ))
                .build();
    }

    @Override
    public List<Rule> rules() {
        return List.of(
                Rule.builder()
                        .filter("true")
                        .action(RuleAction.SetDataValue)
                        .fieldName("aButton,aField")
                        .fieldAttribute(RuleFieldAttribute.disabled)
                        .expression("!state.enable")
                        .result(RuleResult.Continue)
                        .build()
        );
    }
}
