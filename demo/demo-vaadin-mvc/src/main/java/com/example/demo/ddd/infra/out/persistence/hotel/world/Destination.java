package com.example.demo.ddd.infra.out.persistence.hotel.world;

import io.mateu.core.infra.declarative.GenericEntity;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.ForeignKey;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record Destination(
        @NotEmpty
        @EditableOnlyWhenCreating
        String code,
        @NotEmpty
        String name,
        @ForeignKey(search = CountryCodeOptionsSupplier.class, label = CountryLabelSupplier.class)
        @NotNull
        String countryCode
) implements GenericEntity {

    @Override
    public String id() {
        return code;
    }

}
