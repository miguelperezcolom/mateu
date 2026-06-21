package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/subtitle")
@Title("Main Title")
@Subtitle("Supporting subtitle text")
@Getter
@Setter
public class SubtitleForm {

    String name;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
