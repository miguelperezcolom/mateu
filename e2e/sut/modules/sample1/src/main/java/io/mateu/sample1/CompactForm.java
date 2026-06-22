package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/compact")
@Title("Compact Form")
@Compact
@FormLayout(columns = 4)
@Getter
@Setter
public class CompactForm {

    String field1;
    String field2;
    String field3;
    String field4;
    String field5;
    String field6;
    String field7;
    String field8;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
