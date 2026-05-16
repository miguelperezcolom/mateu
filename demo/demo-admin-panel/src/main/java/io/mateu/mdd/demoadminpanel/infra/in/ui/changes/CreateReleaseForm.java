package io.mateu.mdd.demoadminpanel.infra.in.ui.changes;

import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Style;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Title("Create release")
@Style("max-width:900px;margin: auto;")
public class CreateReleaseForm {

    @ReadOnly
    String user;
    @NotNull
    String site;
    @NotEmpty
    String name;

    @Toolbar
    @Action(validationRequired = true)
    Object create() {
        var businessKey = UUID.randomUUID().toString();
        return URI.create("/workflow/processes/" + businessKey + "?returnTo=/controlPlane/releases");
    }

    public CreateReleaseForm withUser(String user) {
        this.user = user;
        return this;
    }
}
