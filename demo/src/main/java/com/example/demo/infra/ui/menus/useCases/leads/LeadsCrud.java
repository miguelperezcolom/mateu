package com.example.demo.infra.ui.menus.useCases.leads;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Scope("prototype")
public class LeadsCrud implements Crud<LeadsSearchForm, LeadsRow> {

  @Autowired @JsonIgnore LeadsDetail detail;

  @Autowired @JsonIgnore LeadsRepo repo;

  public LeadsCrud() {}

  @Override
  public Mono<Page<LeadsRow>> fetchRows(
          String searchText, LeadsSearchForm filters, Pageable pageable) {
    return repo.findAll().collectList()
            .map(items ->new PageImpl<>(items, pageable, items.size()));
  }

  @Override
  public Object getDetail(LeadsRow intermediariesRow) throws Throwable {
    detail.load(intermediariesRow.getId());
    return detail;
  }

  public void block(LeadsRow row) {
    System.out.println("blocking row " + row);
  }

  public void activate(LeadsRow row) {
    System.out.println("activating row " + row);
  }
}
