package io.mateu.mdd.demoadminpanel.infra.in.ui;

import io.mateu.uidl.StyleConstants;
import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Route;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.data.Avatar;
import io.mateu.uidl.data.Badge;
import io.mateu.uidl.data.HorizontalLayout;
import io.mateu.uidl.data.Message;
import io.mateu.uidl.data.State;
import io.mateu.uidl.fluent.Component;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.concurrent.Callable;

@Route("/users/:name")
@Style(StyleConstants.CONTAINER)
@FormLayout(columns = 1)
public class UserDetailPage {

    String name;

    int version;

    @NotEmpty
    @Email
    String email;

    @ReadOnly
    String summary;

    Callable<?> headerStats = () -> new HorizontalLayout(
            new Avatar(name),
            new Badge("v" + version)
    );

    @Button
    public Object save() {
        summary = "User " + name + " saved with version " + version + " and email " + email;
        return List.of(new Message("User saved"), new State(this));
    }

}