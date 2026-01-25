package com.example.demo.ddd.infra.out.persistence.hotel.users;

import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.uidl.annotations.Image;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.data.Status;
import jakarta.validation.constraints.NotEmpty;

public record User(
        @NotEmpty
        String id,
        @NotEmpty
        String name,
        @Image
        String photo,
        @ReadOnly
        Status status
) implements GenericEntity {
}
