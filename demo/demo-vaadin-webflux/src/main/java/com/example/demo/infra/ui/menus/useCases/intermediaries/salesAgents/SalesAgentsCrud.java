package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.mateu.uidl.core.interfaces.Crud;
import io.mateu.uidl.core.annotations.Action;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

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
  public Mono<Page<SalesAgentsRow>> fetchRows(
          String searchText, SalesAgentsSearchForm filters, Pageable pageable) {
    return getFilteredList().collectList()
            .map(items ->new PageImpl<>(items, pageable, items.size()));
  }

  private Flux<SalesAgentsRow> getFilteredList() {
    return repo.findAll().filter(r -> r.getIntermediaryId().equals(intermediaryId));
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
