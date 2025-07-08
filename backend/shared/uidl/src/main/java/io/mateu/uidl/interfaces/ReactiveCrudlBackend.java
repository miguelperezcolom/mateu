package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import reactor.core.publisher.Mono;

public interface ReactiveCrudlBackend<Filters, Row> {

  Mono<Page<Row>> search(String searchText, Filters filters, Pageable pageable);
}
