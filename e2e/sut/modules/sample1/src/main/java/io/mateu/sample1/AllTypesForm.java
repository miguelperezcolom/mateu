package io.mateu.sample1;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@UI("/all-types")
@Title("All Types Form")
@Getter
@Setter
public class AllTypesForm {

    @NotEmpty
    String text;

    int count;

    boolean active;

    LocalDate date;

    @Button
    public Message save() {
        return new Message("Saved: " + text);
    }

    @Toolbar
    public Message refresh() {
        return new Message("Refreshed!");
    }
}
