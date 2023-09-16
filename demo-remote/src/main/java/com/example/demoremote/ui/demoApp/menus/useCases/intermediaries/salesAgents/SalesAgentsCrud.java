package com.example.demoremote.ui.demoApp.menus.useCases.intermediaries.salesAgents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.annotations.Action;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import java.util.List;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Scope("prototype")
@Setter
@Getter
public class SalesAgentsCrud implements Crud<SalesAgentsSearchForm, SalesAgentsRow> {

  @Autowired @JsonIgnore SaleAgentDetail detail;

  @Autowired @JsonIgnore SaleAgentForm form;

  @Autowired @JsonIgnore SalesAgentsRepo repo;

  String intermediaryId;

  @Action
  public void doSomething() {
    repo.all.add(new SalesAgentsRow(UUID.randomUUID().toString(), intermediaryId, "New Name"));
  }

  public SalesAgentsCrud() {}

  @Override
  public Flux<SalesAgentsRow> fetchRows(
      SalesAgentsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable {
    return getFilteredList();
  }

  private Flux<SalesAgentsRow> getFilteredList() {
    return repo.findAll().filter(r -> r.getIntermediaryId().equals(intermediaryId));
  }

  @Override
  public Mono<Long> fetchCount(SalesAgentsSearchForm filters) throws Throwable {
    return getFilteredList().count();
  }

  @Override
  public Object getDetail(SalesAgentsRow intermediariesRow) throws Throwable {
    detail.load(intermediariesRow.getId());
    return detail;
  }

  @Override
  public Object getNewRecordForm() throws Throwable {
    return form;
  }
}
