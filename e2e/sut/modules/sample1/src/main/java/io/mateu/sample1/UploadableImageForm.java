package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/uploadable-image")
@Title("Uploadable Image Form")
@Getter
@Setter
public class UploadableImageForm {

    String name;

    @UploadableImage
    String avatar;

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
