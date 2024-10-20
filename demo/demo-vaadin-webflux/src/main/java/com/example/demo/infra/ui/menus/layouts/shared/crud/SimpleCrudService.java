package com.example.demo.infra.ui.menus.layouts.shared.crud;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
public class SimpleCrudService {

    final List<Row> rows = List.of(
            new Row("1", "Mateu", 16),
            new Row("2", "Antonia", 47),
            new Row("3", "Miguel", 55)
    );

    private static boolean applyFilter(String searchText, SearchForm filters, Row r) {
        return searchText == null || r.name().toLowerCase()
                .contains(searchText.toLowerCase());
    }

    public Mono<Page<Row>> fetchRows(String searchText, SearchForm filters, Pageable pageable) {
        var items = rows.stream()
                .filter(r -> applyFilter(searchText, filters, r))
                .toList();
        return Mono.just(new PageImpl<>(items, pageable, items.size()));
    }
}
