package io.mateu.demo.complexview.crud;

import io.mateu.dtos.SortCriteria;
import java.util.List;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class SimpleCrudService {

  List<Row> rows =
      List.of(new Row("1", "Mateu", 16), new Row("2", "Antonia", 47), new Row("3", "Miguel", 55));

  public Flux<Row> fetchRows(
      SearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
    return Flux.fromIterable(rows.stream().filter(r -> applyFilter(filters, r)).toList());
  }

  private static boolean applyFilter(SearchForm filters, Row r) {
    return filters.getText() == null
        || r.getName().toLowerCase().contains(filters.getText().toLowerCase());
  }

  public Mono<Long> fetchCount(SearchForm filters) {
    return Mono.just(rows.stream().filter(r -> applyFilter(filters, r)).count());
  }
}