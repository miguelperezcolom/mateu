package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.EditableOnlyWhenCreating;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record Destination(
        @NotEmpty
        @EditableOnlyWhenCreating
        String code,
        @NotEmpty
        String name,
        @ForeignKey(CountryCodeOptionsSupplier.class)
        @NotNull
        String countryCode,
        @NotEmpty
        @ForeignKey(HotelIdOptionsSupplier.class)
        List<String> hotelIds
) implements GenericEntity {

    @Override
    public String id() {
        return code;
    }

}
