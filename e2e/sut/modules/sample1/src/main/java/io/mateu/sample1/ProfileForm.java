package io.mateu.sample1;

import io.mateu.uidl.annotations.*;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@UI("/profile")
@Title("Profile")
@FormLayout(columns = 1)
@Getter
@Setter
public class ProfileForm {

    @NotEmpty
    String username;

    @Stereotype(FieldStereotype.textarea)
    String bio;

    @ReadOnly
    String accountId = "ACC-001";

    @Button
    public void save() {
    }

    @Toolbar
    public Message reset() {
        return new Message("Reset!");
    }
}
