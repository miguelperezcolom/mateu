package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/sections")
@Title("Sections Form")
@Getter
@Setter
public class SectionsForm {

    @Section("Personal Info")
    String firstName;

    @Section("Personal Info")
    String lastName;

    @Section("Contact")
    String phone;

    @Section("Contact")
    String city;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
