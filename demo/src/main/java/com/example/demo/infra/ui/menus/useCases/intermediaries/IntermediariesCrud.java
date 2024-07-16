package com.example.demo.infra.ui.menus.useCases.intermediaries;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Scope("prototype")
public class IntermediariesCrud implements Crud<IntermediariesSearchForm, IntermediariesRow> {

  @Autowired @JsonIgnore IntermediaryDetail detail;

  @Autowired @JsonIgnore IntermediariesRepo repo;

  public IntermediariesCrud() {}

  @Override
  public Flux<IntermediariesRow> fetchRows(
      IntermediariesSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable {
    return repo.findAll();
  }

  @Override
  public Mono<Long> fetchCount(IntermediariesSearchForm filters) throws Throwable {
    return repo.findAll().count();
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
