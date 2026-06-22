package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/accordion")
@Title("Accordion Form")
@Accordion
@Getter
@Setter
public class AccordionForm {

    @AccordionPanel(summary = "Basic Info")
    @Section("Basic Info")
    String name;

    @AccordionPanel(summary = "Basic Info")
    @Section("Basic Info")
    String email;

    @AccordionPanel(summary = "Details")
    @Section("Details")
    String description;

    @AccordionPanel(summary = "Details")
    @Section("Details")
    int priority;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
