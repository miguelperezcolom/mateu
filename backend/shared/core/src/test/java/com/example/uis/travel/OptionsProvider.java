package com.example.uis.travel;

import com.example.uis.travel.uidl.Option;
import com.example.uis.travel.uidl.Page;
import com.example.uis.travel.uidl.Pageable;
import reactor.core.publisher.Mono;

public interface OptionsProvider {

    Mono<Page<Option>> fetchOptions(String listKey, String searchText, Pageable pageable)
            throws Throwable;

}
