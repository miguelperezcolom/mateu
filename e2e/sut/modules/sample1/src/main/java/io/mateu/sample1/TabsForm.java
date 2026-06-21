package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/tabs")
@Title("Tabs Form")
@Tabs
@Getter
@Setter
public class TabsForm {

    @Tab("Personal")
    @Section("Personal Data")
    String firstName;

    @Tab("Personal")
    @Section("Personal Data")
    String lastName;

    @Tab("Address")
    @Section("Address Data")
    String street;

    @Tab("Address")
    @Section("Address Data")
    String city;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
