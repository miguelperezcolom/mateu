package com.example.uis.travel.uidl;

import reactor.core.publisher.Mono;

public interface Listing<Filters, Row> {

    Mono<Page<Row>> search(String text, Filters filters, Pageable pageable);

}
