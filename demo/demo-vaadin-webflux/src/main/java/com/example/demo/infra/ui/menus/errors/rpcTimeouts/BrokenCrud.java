package com.example.demo.infra.ui.menus.errors.rpcTimeouts;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinitionlanguage.core.interfaces.Crud;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

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
