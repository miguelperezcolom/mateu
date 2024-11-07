package io.mateu.demo.complexview.crud;

import io.mateu.core.domain.model.outbound.Humanizer;
import io.mateu.uidl.core.annotations.MateuUI;
import io.mateu.uidl.core.interfaces.Crud;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

@MateuUI("/crud")
@Component
@Scope("prototype")
public class SimpleCrud implements Crud<SearchForm, Row> {

  @Autowired SimpleCrudService service;
  @Autowired private Humanizer humanizer;

  @Override
  public Mono<Page<Row>> fetchRows(String searchText, SearchForm filters, Pageable pageable)
      throws Throwable {
    return service.fetchRows(searchText, filters, pageable);
  }

  @Override
  public String toString() {
    return humanizer.capitalize(getClass().getSimpleName());
  }
}
