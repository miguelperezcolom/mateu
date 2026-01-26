package com.example.demo.ddd.infra.out.persistence.hotel.users;

import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Image;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.Status;
import jakarta.validation.constraints.NotEmpty;

public record User(
        @NotEmpty
        String id,
        @NotEmpty
        String name,
        @Image(style = "max-width: 100px; border-radius: 50%; object-fit: cover;", rowStyle = "border-radius: 50%; object-fit: cover;")
        @Colspan(2)
        String photo,
        @ReadOnly
        Status status,

        @HiddenInList
        boolean admin,
        @HiddenInList
        boolean operator,
        @HiddenInList
        boolean manager,
        @HiddenInList
        boolean client
) implements GenericEntity {
}
