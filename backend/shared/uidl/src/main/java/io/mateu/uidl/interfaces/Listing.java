package io.mateu.uidl.interfaces;

import io.mateu.uidl.data.Page;
import io.mateu.uidl.data.Pageable;
import reactor.core.publisher.Mono;

public interface Listing<Filters, Row> extends Content {

  Mono<Page<Row>> search(String text, Filters filters, Pageable pageable);
}
