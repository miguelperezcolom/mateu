package com.example.demo.ddd.infra.out.persistence.hotel.hotel;

import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.core.infra.valuegenerators.UUIDValueGenerator;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.GeneratedValue;
import io.mateu.uidl.annotations.ReadOnly;

public record Inventory(
        @ReadOnly String hotelId,
        @GeneratedValue(UUIDValueGenerator.class) String id,
        String name) implements GenericEntity {
}
