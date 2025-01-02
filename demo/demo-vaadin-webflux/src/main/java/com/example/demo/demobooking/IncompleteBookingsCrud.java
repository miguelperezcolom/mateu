package com.example.demo.demobooking;

import io.mateu.uidl.interfaces.Crud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

record Filters() {

}

record Row(String id, String leadName) {

}

public class IncompleteBookingsCrud implements Crud<Filters, Row> {

    @Override
    public Mono<Page<Row>> fetchRows(String searchText, Filters filters, Pageable pageable) throws Throwable {
        return Mono.just(Page.empty());
    }
}
