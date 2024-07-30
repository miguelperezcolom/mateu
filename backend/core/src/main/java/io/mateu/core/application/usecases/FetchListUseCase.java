package io.mateu.core.application.usecases;

import io.mateu.core.application.dtos.Page;
import io.mateu.core.application.util.OrderingDeserializer;
import io.mateu.core.domain.model.store.JourneyContainer;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.queries.getListCount.GetListCountQuery;
import io.mateu.core.domain.queries.getListCount.GetListCountQueryHandler;
import io.mateu.core.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.core.domain.queries.getListRows.GetListRowsQueryHandler;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
public class FetchListUseCase {

  private final Serializer serializer;
  private final GetListRowsQueryHandler getListRowsQueryHandler;
  private final GetListCountQueryHandler getListCountQueryHandler;

  public FetchListUseCase(
      Serializer serializer,
      GetListRowsQueryHandler getListRowsQueryHandler,
      GetListCountQueryHandler getListCountQueryHandler) {
    this.serializer = serializer;
    this.getListRowsQueryHandler = getListRowsQueryHandler;
    this.getListCountQueryHandler = getListCountQueryHandler;
  }

  public Mono<Page> fetchPage(
      String uiId,
      String journeyTypeId,
      String journeyId,
      String stepId,
      String listId,
      int page,
      int page_size,
      // urlencoded form of filters json serialized
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      Map<String, Object> journey,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    JourneyContainer journeyContainer =
        serializer.fromJson(serializer.toJson(journey), JourneyContainer.class);
    return getListRowsQueryHandler
        .run(
            GetListRowsQuery.builder()
                .journeyContainer(journeyContainer)
                .stepId(stepId)
                .listId(listId)
                .page(page)
                .pageSize(page_size)
                .filters(filters)
                .ordering(new OrderingDeserializer(ordering).deserialize(serializer))
                .serverHttpRequest(serverHttpRequest)
                .build())
        .collectList()
        .zipWith(
            page > 0
                ? Mono.just(-1L)
                : getListCountQueryHandler.run(
                    GetListCountQuery.builder()
                        .journeyContainer(journeyContainer)
                        .stepId(stepId)
                        .listId(listId)
                        .filters(filters)
                        .serverHttpRequest(serverHttpRequest)
                        .build()))
        .map(tuple -> new Page(tuple.getT1(), tuple.getT2()));
  }
}
