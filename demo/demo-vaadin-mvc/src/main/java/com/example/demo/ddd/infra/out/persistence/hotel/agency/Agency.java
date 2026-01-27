package com.example.demo.ddd.infra.out.persistence.hotel.agency;

import io.mateu.core.infra.declarative.Deleteable;
import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.uidl.annotations.Disabled;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.Hidden;
import jakarta.validation.constraints.NotEmpty;

public record Agency(
        @EditableOnlyWhenCreating
        @NotEmpty
        String id,
        @NotEmpty
        String name,
        boolean active
) implements GenericEntity, Deleteable {
}
