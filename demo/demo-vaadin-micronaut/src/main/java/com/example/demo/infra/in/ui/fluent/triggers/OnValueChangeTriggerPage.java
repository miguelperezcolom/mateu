package com.example.demo.infra.in.ui.fluent.triggers;

import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FormField;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Action;
import io.mateu.uidl.fluent.Form;
import io.mateu.uidl.fluent.ActionSupplier;
import io.mateu.uidl.fluent.TriggersSupplier;
import io.mateu.uidl.fluent.OnValueChangeTrigger;
import io.mateu.uidl.fluent.Trigger;
import io.mateu.uidl.interfaces.ComponentTreeSupplier;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

@Route(value="/triggers/on-value-change", parentRoute="^$")
public class OnValueChangeTriggerPage implements ComponentTreeSupplier, ActionSupplier, TriggersSupplier {
    @Override
    public Form component(HttpRequest httpRequest) {
        return Form.builder()
                .title("On value change trigger")
                .content(List.of(
                        FormField.builder()
                                .id("name")
                                .dataType(FieldDataType.string)
                                .label("Name")
                                .build(),
                        FormField.builder()
                                .id("age")
                                .dataType(FieldDataType.integer)
                                .label("Age")
                                .build(),
                        new Text("Name change should triger a console.log")
                ))
                .build();
    }

    @Override
    public List<Action> actions() {
        return List.of(
                Action.builder()
                        .id("action")
                        .js("console.log('new state', state)")
                        .build()
        );
    }

    @Override
    public List<Trigger> triggers() {
        return List.of(
                new OnValueChangeTrigger("action", "name", null)
        );
    }
}
