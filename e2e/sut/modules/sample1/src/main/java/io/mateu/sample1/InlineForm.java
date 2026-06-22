package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/inline")
@Title("Inline Form")
@Getter
@Setter
public class InlineForm {

    String mainName;

    @Section("Address")
    @Inline
    AddressInfo address = new AddressInfo();

    @Button
    public Message save() {
        return new Message("Saved!");
    }

    @Getter
    @Setter
    public static class AddressInfo {
        String street;
        String city;
        String country;
    }

}
