package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/folded")
@Title("Folded Layout Form")
@FoldedLayout
@Getter
@Setter
public class FoldedLayoutForm {

    @Section("Section A")
    String fieldA1;

    @Section("Section A")
    String fieldA2;

    @Section("Section B")
    String fieldB1;

    @Section("Section B")
    String fieldB2;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
