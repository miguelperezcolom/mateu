package com.example.demo.infra.in.ui.fluent.rules;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
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

@Route(value="/rules/set-attribute-value", parentRoute="^$")
public class SetAttributeValueRulePage implements ComponentTreeSupplier, RuleSupplier {

    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("Set attribute value rule")
                .content(List.of(
                        FormField.builder()
                                .id("text")
                                .dataType(FieldDataType.string)
                                .label("Text field")
                                .stereotype(FieldStereotype.html)
                                .initialValue("Hola!")
                                .build(),
                        FormField.builder()
                                .id("trigger")
                                .dataType(FieldDataType.bool)
                                .label("Check/uncheck to trigger rule. Look at the console to see the effect.")
                                .build()
                ))
                .build();
    }

    @Override
    public List<Rule> rules() {
        return List.of(
                Rule.builder()
                        .filter("state.trigger")
                        .action(RuleAction.SetAttributeValue)
                        .fieldAttribute(RuleFieldAttribute.style)
                        .fieldName("text")
                        .value("border: 3px solid blue;")
                        .result(RuleResult.Continue)
                        .build(),
                Rule.builder()
                        .filter("!state.trigger")
                        .action(RuleAction.SetAttributeValue)
                        .fieldAttribute(RuleFieldAttribute.style)
                        .fieldName("text")
                        .value("border: 3px solid red;")
                        .result(RuleResult.Continue)
                        .build()

        );
    }

}
