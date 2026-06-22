package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/hidden-fields")
@Title("Hidden Fields Form")
@Getter
@Setter
public class HiddenFieldsForm {

    String visibleField;

    @Hidden
    String hiddenField = "secret";

    @ReadOnly
    String readOnlyField = "readonly-value";

    @Button
    public Message save() {
        return new Message("Saved!");
    }

}
