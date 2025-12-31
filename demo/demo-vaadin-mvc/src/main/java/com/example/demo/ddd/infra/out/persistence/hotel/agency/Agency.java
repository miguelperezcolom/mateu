package com.example.demo.ddd.infra.out.persistence.hotel.agency;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import jakarta.validation.constraints.NotEmpty;

public record Agency(
        @EditableOnlyWhenCreating
        @NotEmpty
        String id,
        @NotEmpty
        String name
) implements GenericEntity {
}
