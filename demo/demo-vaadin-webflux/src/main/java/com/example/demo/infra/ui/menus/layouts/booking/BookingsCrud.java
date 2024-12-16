package com.example.demo.infra.ui.menus.layouts.booking;

import com.example.demo.infra.ui.menus.layouts.ViewWithRemoteContent;
import io.mateu.uidl.annotations.Action;
import io.mateu.uidl.annotations.Money;
import io.mateu.uidl.interfaces.Crud;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.List;

record BookingCrudFilters() {
}

record BookingCrudRow(String id, String text, @Money double value, @Money BigDecimal money) {
}

public class BookingsCrud implements Crud<BookingCrudFilters, BookingCrudRow> {

    List<BookingCrudRow> data = List.of(
            new BookingCrudRow("1", "Hola!", 1200, BigDecimal.valueOf(200)),
            new BookingCrudRow("2", "Hola de nuevo!", 100.2032, null),
                new BookingCrudRow("3", "Hola otra vez!", -15, BigDecimal.valueOf(100.01))
            );

    @Override
    public Mono<Page<BookingCrudRow>> fetchRows(String searchText, BookingCrudFilters filters, Pageable pageable) throws Throwable {
        var filteredRows = data.stream().filter(r -> searchText == null || r.text().toLowerCase().contains(searchText.toLowerCase())).toList();
        return Mono.just(new PageImpl<>(filteredRows, pageable, filteredRows.size()));
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
