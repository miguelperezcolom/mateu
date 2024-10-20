package io.mateu.core.application.usecases;

import io.mateu.core.domain.queries.getItemsCount.GetItemsCountQuery;
import io.mateu.core.domain.queries.getItemsCount.GetItemsCountQueryHandler;
import io.mateu.core.domain.queries.getItemsRows.GetItemsRowsQuery;
import io.mateu.core.domain.queries.getItemsRows.GetItemsRowsQueryHandler;
import io.mateu.dtos.Items;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

@Service
@Slf4j
public class FetchItemsUseCase {

  private final GetItemsCountQueryHandler getItemsCountQueryHandler;
  private final GetItemsRowsQueryHandler getItemsRowsQueryHandler;

  public FetchItemsUseCase(
      GetItemsCountQueryHandler getItemsCountQueryHandler,
      GetItemsRowsQueryHandler getItemsRowsQueryHandler) {
    this.getItemsCountQueryHandler = getItemsCountQueryHandler;
    this.getItemsRowsQueryHandler = getItemsRowsQueryHandler;
  }

  public Mono<Items> getItems(String itemProviderId, int page, int page_size, String search_text)
      throws Throwable {
    return Mono.just(
            new Items(
                getItemsRowsQueryHandler.run(
                    GetItemsRowsQuery.builder()
                        .itemsProviderId(itemProviderId)
                        .page(page)
                        .pageSize(page_size)
                        .searchText(search_text)
                        .build()),
                getItemsCountQueryHandler.run(
                    GetItemsCountQuery.builder()
                        .itemsProviderId(itemProviderId)
                        .searchText(search_text)
                        .build())))
        .subscribeOn(Schedulers.boundedElastic());
  }
}
