package com.example.demo.infra.ui.menus.useCases.intermediaries;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.core.interfaces.Crud;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Scope("prototype")
public class IntermediariesCrud implements Crud<IntermediariesSearchForm, IntermediariesRow> {

  @Autowired @JsonIgnore IntermediaryDetail detail;

  @Autowired @JsonIgnore IntermediariesRepo repo;

  public IntermediariesCrud() {}

  @Override
  public Mono<Page<IntermediariesRow>> fetchRows(
          String searchText, IntermediariesSearchForm filters, Pageable pageable) {
    return repo.findAll().collectList()
            .map(items ->new PageImpl<>(items, pageable, items.size()));
  }

  @Override
  public Object getDetail(IntermediariesRow intermediariesRow) throws Throwable {
    detail.load(intermediariesRow.getId());
    return detail;
  }

  public void block(IntermediariesRow row) {
    System.out.println("blocking row " + row);
  }

  public void activate(IntermediariesRow row) {
    System.out.println("activating row " + row);
  }
}
