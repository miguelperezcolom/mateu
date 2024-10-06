package io.mateu.demo.complexview.crud;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class SimpleCrudService {

  List<Row> rows =
      List.of(new Row("1", "Mateu", 16), new Row("2", "Antonia", 47), new Row("3", "Miguel", 55));

  public Mono<Page<Row>> fetchRows(String searchText, SearchForm filters, Pageable pageable) {
    var items = rows.stream().filter(r -> applyFilter(filters, r)).toList();
    return Mono.just(
        new PageImpl<>(
            rows.stream().filter(r -> applyFilter(filters, r)).toList(), pageable, items.size()));
  }

  private static boolean applyFilter(SearchForm filters, Row r) {
    return filters.getText() == null
        || r.getName().toLowerCase().contains(filters.getText().toLowerCase());
  }
}
