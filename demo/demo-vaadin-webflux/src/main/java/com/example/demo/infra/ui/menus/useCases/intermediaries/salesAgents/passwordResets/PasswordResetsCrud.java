package com.example.demo.infra.ui.menus.useCases.intermediaries.salesAgents.passwordResets;

import io.mateu.uidl.interfaces.Crud;
import lombok.Getter;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Scope;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@Scope("prototype")
@Setter
@Getter
@Slf4j
public class PasswordResetsCrud implements Crud<SalesAgentsSearchForm, PasswordResetsRow> {

  String salesAgentId;

  public PasswordResetsCrud() {}

  @Override
  public Mono<Page<PasswordResetsRow>> fetchRows(
          String searchText, SalesAgentsSearchForm filters, Pageable pageable) {
    return getFilteredList().collectList()
            .map(items ->new PageImpl<>(items, pageable, items.size()));
  }

  private Flux<PasswordResetsRow> getFilteredList() {
    log.info("sales agent targetId: " + salesAgentId);
    return Flux.just(
            new PasswordResetsRow("1", "1", "2023-01-12"),
            new PasswordResetsRow("2", "2", "2023-02-11"))
        .filter(r -> r.getId().equals(salesAgentId));
  }

}
