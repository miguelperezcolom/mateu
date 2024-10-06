package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import com.example.demo.infra.ui.menus.layouts.shared.crud.Row;
import com.example.demo.infra.ui.menus.layouts.shared.crud.SearchForm;
import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Scope("prototype")
public class BrokenCrud implements Crud<BrokenSearchForm, BrokenRow> {

  @Autowired @JsonIgnore BrokenDetail detail;

  @Autowired @JsonIgnore BrokenRepo repo;

  public BrokenCrud() {}

  @Override
  public Mono<Page<BrokenRow>> fetchRows(
          String searchText, BrokenSearchForm filters, Pageable pageable) throws InterruptedException {
    return repo.findAll().collectList()
            .map(items ->new PageImpl<>(items, pageable, items.size()));
  }

  @Override
  public Object getDetail(BrokenRow intermediariesRow) throws Throwable {
    detail.load(intermediariesRow.getId());
    return detail;
  }

  public void block(BrokenRow row) {
    System.out.println("blocking row " + row);
  }

  public void activate(BrokenRow row) {
    System.out.println("activating row " + row);
  }
}
