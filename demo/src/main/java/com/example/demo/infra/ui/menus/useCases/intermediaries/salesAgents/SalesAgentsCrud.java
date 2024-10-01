package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.core.domain.uidefinition.shared.annotations.Action;
import io.mateu.dtos.SortCriteria;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

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
      String searchText, SalesAgentsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
    return getFilteredList();
  }

  private Flux<SalesAgentsRow> getFilteredList() {
    return repo.findAll().filter(r -> r.getIntermediaryId().equals(intermediaryId));
  }

  @Override
  public Mono<Long> fetchCount(String searchText, SalesAgentsSearchForm filters) {
    return getFilteredList().count();
  }

  @Override
  public Object getDetail(SalesAgentsRow intermediariesRow) throws Throwable {
    detail.load(intermediariesRow.getId());
    return detail;
  }

  @Override
  public Object getNewRecordForm() {
    return form;
  }
}
