package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.UICommand;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

/**
 * Exercises {@code @ConfirmOnNavigationIfDirty}: the frontend must track field changes and prompt
 * the user before leaving the form with unsaved changes. {@code save()} returns
 * {@link UICommand#markAsClean()} so leaving after a successful save no longer prompts.
 */
@UI("/confirm-dirty")
@Title("Confirm Dirty Form")
@ConfirmOnNavigationIfDirty
@Getter
@Setter
public class ConfirmOnNavigationForm {

    String name = "Alice";

    String email = "alice@example.com";

    @Button
    public Object save() {
        return List.of(new Message("Saved!"), UICommand.markAsClean());
    }
}
