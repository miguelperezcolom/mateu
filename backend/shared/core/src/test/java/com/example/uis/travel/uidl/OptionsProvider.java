package com.example.uis.travel.uidl;

import reactor.core.publisher.Mono;

public interface OptionsProvider {

    Mono<Page<Option>> fetchOptions(String listKey, String searchText, Pageable pageable)
            throws Throwable;

}
