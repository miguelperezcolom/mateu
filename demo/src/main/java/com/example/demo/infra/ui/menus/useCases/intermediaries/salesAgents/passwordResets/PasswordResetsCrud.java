package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents.passwordResets;

import io.mateu.core.domain.uidefinition.core.interfaces.Crud;
import io.mateu.dtos.SortCriteria;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;

@Service
@Scope("prototype")
@Setter
@Getter
@Slf4j
public class PasswordResetsCrud implements Crud<SalesAgentsSearchForm, PasswordResetsRow> {

  String salesAgentId;

  public PasswordResetsCrud() {}

  @Override
  public Flux<PasswordResetsRow> fetchRows(
      String searchText, SalesAgentsSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit) {
    return getFilteredList();
  }

  private Flux<PasswordResetsRow> getFilteredList() {
    log.info("sales agent targetId: " + salesAgentId);
    return Flux.just(
            new PasswordResetsRow("1", "1", "2023-01-12"),
            new PasswordResetsRow("2", "2", "2023-02-11"))
        .filter(r -> r.getId().equals(salesAgentId));
  }

  @Override
  public Mono<Long> fetchCount(String searchText, SalesAgentsSearchForm filters) {
    return getFilteredList().count();
  }
}
