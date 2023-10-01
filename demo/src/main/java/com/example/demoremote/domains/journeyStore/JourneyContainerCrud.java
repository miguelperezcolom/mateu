package com.example.demoremote.domains.journeyStore;

import io.mateu.mdd.core.interfaces.Crud;
import io.mateu.mdd.shared.interfaces.SortCriteria;
import io.mateu.core.domain.store.JourneyRepository;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Component
public class JourneyContainerCrud implements Crud<JourneyContainerSearchForm, JourneyContainerRow> {

  @Autowired private JourneyRepository repo;

  @Override
  public Flux<JourneyContainerRow> fetchRows(
      JourneyContainerSearchForm filters, List<SortCriteria> sortOrders, int offset, int limit)
      throws Throwable {
    return repo.findAll().map(c -> new JourneyContainerRow(
            c.getJourneyId(),
            c.getJourneyTypeId(),
            c.getRemoteBaseUrl(),
            c.getRemoteJourneyTypeId(),
            c.getJourneyClass(),
            c.getCreated(),
            c.getLastAccess()
    ));
  }

  @Override
  public Mono<Long> fetchCount(JourneyContainerSearchForm filters) throws Throwable {
    return repo.count();
  }

  @Override
  public Object getDetail(JourneyContainerRow row) throws Throwable {
    return repo.findById(row.getJourneyId()).get();
  }
}
