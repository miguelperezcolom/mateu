package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Rule;
import io.mateu.uidl.data.RuleAction;
import io.mateu.uidl.data.RuleFieldAttribute;
import io.mateu.uidl.data.RuleResult;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.RuleSupplier;

import java.util.List;

@Route("/fluent-app/rules/visibility")
public class VisibilityRulePage implements ComponentTreeSupplier, RuleSupplier {

    boolean hidden = false;

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Visibility rule")
                .content(List.of(
                        Text.builder()
                                .id("texto")
                                .text("Now you see me")
                                .build(),
                        FormField.builder()
                                .id("hidden")
                                .dataType(FieldDataType.bool)
                                .label("Hidden")
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
                        .fieldName("texto")
                        .fieldAttribute(RuleFieldAttribute.hidden)
                        .expression("state.hidden")
                        .result(RuleResult.Continue)
                        .build()
        );
    }
}
