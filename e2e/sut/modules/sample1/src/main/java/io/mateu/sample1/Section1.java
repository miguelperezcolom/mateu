package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Title("Section 1")
@Getter
@Setter
public class Section1 {

    @NotEmpty
    String value;

    @Button
    public Message submit() {
        return new Message("Submitted: " + value);
    }

}
