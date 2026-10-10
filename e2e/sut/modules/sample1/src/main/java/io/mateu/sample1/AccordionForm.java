package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/accordion")
@Title("Accordion Form")
@FoldedLayout
@Getter
@Setter
public class AccordionForm {
    @Section("Basic Info")
    String name;
    @Section("Basic Info")
    String email;
    @Section("Details")
    String description;
    @Section("Details")
    int priority;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
