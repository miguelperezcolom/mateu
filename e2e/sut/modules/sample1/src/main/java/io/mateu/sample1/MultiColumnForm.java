package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/multi-column")
@Title("Multi Column Form")
@FormLayout(columns = 3)
@Getter
@Setter
public class MultiColumnForm {

    String field1;

    String field2;

    String field3;

    String field4;

    String field5;

    String field6;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
