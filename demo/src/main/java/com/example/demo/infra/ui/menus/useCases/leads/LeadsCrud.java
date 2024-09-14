package com.example.demo.infra.ui.menus.useCases.leads;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Scope("prototype")
public class LeadsCrud implements Crud<LeadsSearchForm, LeadsRow> {

  @Autowired @JsonIgnore LeadsDetail detail;

  @Autowired @JsonIgnore LeadsRepo repo;

  public LeadsCrud() {}

  @Override
  public Flux<LeadsRow> fetchRows(
      LeadsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
    return repo.findAll();
  }

  @Override
  public Mono<Long> fetchCount(LeadsSearchForm filters) {
    return repo.findAll().count();
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
