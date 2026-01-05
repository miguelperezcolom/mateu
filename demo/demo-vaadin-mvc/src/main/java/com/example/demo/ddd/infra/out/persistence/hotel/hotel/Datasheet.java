package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import io.mateu.core.infra.declarative.Entity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.Image;
import io.mateu.uidl.annotations.ReadOnly;

public record Datasheet(
        @ReadOnly
        String id,
        String name,
        @Image
        String image,
        int stars
) implements Entity<String> {
}
