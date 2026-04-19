package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Route("/users/:id/edit")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class UserEditorPage {

    String id;

    @NotEmpty
    String name;

    @NotEmpty
    @Email
    String email;

    @Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
    @Stereotype(FieldStereotype.checkbox)
    List<String> roles;

    @Button
    Object save() {
        return List.of(
                new Message("User saved"),
                new State(this)
        );
    }

}
