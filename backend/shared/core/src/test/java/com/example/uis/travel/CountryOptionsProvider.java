package com.example.uis.travel;

import com.example.uis.travel.uidl.Option;
import com.example.uis.travel.uidl.OptionsProvider;
import com.example.uis.travel.uidl.Page;
import com.example.uis.travel.uidl.Pageable;
import jakarta.inject.Named;
import reactor.core.publisher.Mono;

@Named
public class CountryOptionsProvider implements OptionsProvider {


    @Override
    public Mono<Page<Option>> fetchOptions(String listKey, String searchText, Pageable pageable) throws Throwable {
        return Mono.empty();
    }
}
