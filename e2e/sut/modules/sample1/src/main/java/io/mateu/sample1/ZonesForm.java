package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/zones")
@Title("Zones Form")
@Zones({
    @Zone(name = "left", width = "60%"),
    @Zone(name = "right", width = "40%")
})
@Getter
@Setter
public class ZonesForm {

    @Section(value = "Left Data", zone = "left")
    String leftField1;

    @Section(value = "Left Data", zone = "left")
    String leftField2;

    @Section(value = "Right Data", zone = "right")
    String rightField1;

    @Section(value = "Right Data", zone = "right")
    String rightField2;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
