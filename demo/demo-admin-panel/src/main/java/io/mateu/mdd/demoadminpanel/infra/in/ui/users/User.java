package io.mateu.mdd.demoadminpanel.infra.in.ui.users;

import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record User(
        @NotEmpty String id,
        @NotEmpty String name,
        @NotEmpty @Email String email,
        @Stereotype(FieldStereotype.checkbox)
        @Lookup(search = RoleOptionsSupplier.class, label = RoleLabelSupplier.class)
        List<String> roles
) implements Identifiable {

    @Override
    public String toString() {
        return name != null ? name : "New user";
    }
}
