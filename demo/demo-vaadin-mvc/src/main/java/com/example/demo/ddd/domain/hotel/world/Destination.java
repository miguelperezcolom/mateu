package com.example.demo.ddd.domain.hotel.world;

import com.example.demo.ddd.infra.in.ui.pages.shared.GenericEntity;
import io.mateu.uidl.annotations.ForeignKey;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.HttpRequest;

import java.util.List;

public record Destination(
        String code,
        String name,
        @ForeignKey(CountryCodeOptionsSupplier.class)
        String countryCode,
        List<String> hotelIds
) implements GenericEntity {

    @Override
    public String id() {
        return code;
    }

}
