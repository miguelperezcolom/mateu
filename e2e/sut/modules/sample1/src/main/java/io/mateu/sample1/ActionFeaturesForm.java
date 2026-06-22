package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.Message;
import lombok.Getter;
import lombok.Setter;

@UI("/action-features")
@Title("Action Features Form")
@Getter
@Setter
public class ActionFeaturesForm {

    String text;

    @Button
    @Action(shortcut = "ctrl+s")
    public Message saveWithShortcut() {
        return new Message("Saved via shortcut!");
    }

    @Button
    @Action(confirmationRequired = true, confirmationTitle = "Confirm Delete",
            confirmationMessage = "Are you sure?")
    public Message deleteWithConfirm() {
        return new Message("Deleted!");
    }

    @Button
    @Action(validationRequired = true)
    public Message validateAndSubmit() {
        return new Message("Submitted!");
    }

    @Toolbar
    public Message refresh() {
        return new Message("Refreshed!");
    }

}
