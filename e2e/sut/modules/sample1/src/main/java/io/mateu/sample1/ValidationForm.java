package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@UI("/validation")
@Title("Validation Form")
@Getter
@Setter
public class ValidationForm {

    @NotEmpty
    String requiredText;

    @NotNull
    LocalDate requiredDate;

    @Min(1)
    @Max(100)
    int rangedInt;

    @Min(0)
    double positiveDouble;

    @Button
    public Message validate() {
        return new Message("Valid!");
    }

}
