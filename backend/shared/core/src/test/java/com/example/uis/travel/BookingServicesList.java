package com.example.uis.travel;

import com.example.uis.travel.uidl.Listing;
import com.example.uis.travel.uidl.Page;
import com.example.uis.travel.uidl.Pageable;
import reactor.core.publisher.Mono;

record BookingServicesListFilters() {

}

record BookingServicesListRow() {

}

public class BookingServicesList implements Listing<BookingServicesListFilters, BookingServicesListRow> {
    @Override
    public Mono<Page<BookingServicesListRow>> search(String text, BookingServicesListFilters bookingServicesListFilters, Pageable pageable) {
        return Mono.empty();
    }
}
