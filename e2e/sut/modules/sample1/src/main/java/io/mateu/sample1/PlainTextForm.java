package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/plain-text")
@Title("Plain Text Form")
@Getter
@Setter
public class PlainTextForm {

    @PlainText
    String displayName = "John Doe";

    @PlainText
    int displayCount = 42;

    String editableField;

    @Button
    public Message update() {
        return new Message("Updated!");
    }

}
