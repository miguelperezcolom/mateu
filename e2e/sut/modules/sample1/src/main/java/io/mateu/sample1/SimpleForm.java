package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;

@UI("")
@Title("Simple Form")
public class SimpleForm {

    @NotEmpty
    String name;

    @Button
    public Message greet() {
        return new Message("Hello " + name + "!");
    }

}
