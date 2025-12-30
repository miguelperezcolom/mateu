package com.example.demo.ddd.domain.hotel.world;

import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import io.mateu.uidl.interfaces.ForeignKeyOptionsSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CountryCodeOptionsSupplier implements ForeignKeyOptionsSupplier {

    final CountryRepository countryRepository;

    @Override
    public ListingData<Option> search(String searchText, Pageable pageable, HttpRequest httpRequest) {
        var found = countryRepository.search(searchText , pageable);
        return new ListingData<>(new Page<>(
                searchText,
                found.page().pageSize(),
                found.page().pageNumber(),
                found.page().totalElements(),
                found.page().content().stream().map(country ->
                        new Option(country.code(), country.name())).toList()));
    }
}
