package com.example.demo.infra.ui.menus.layouts.booking;

import com.example.demo.infra.ui.menus.layouts.ViewWithRemoteContent;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.interfaces.Crud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

import java.util.List;

record BookingCrudFilters() {
}

record BookingCrudRow(String id, String text) {
}

public class BookingsCrud implements Crud<BookingCrudFilters, BookingCrudRow> {
    @Override
    public Mono<Page<BookingCrudRow>> fetchRows(String searchText, BookingCrudFilters filters, Pageable pageable) throws Throwable {
        return Mono.just(new PageImpl<>(List.of(
                new BookingCrudRow("1", "Hola!")
        ), pageable, 1));
    }

    @Override
    public Object getDetail(BookingCrudRow bookingCrudRow) throws Throwable {
        return new ViewWithRemoteContent();
    }

    @Action
    public ViewWithRemoteContent view() {
        return new ViewWithRemoteContent();
    }
}
