package io.mateu.core.application.usecases.fetchlist;

import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.queries.getListCount.GetListCountQuery;
import io.mateu.core.domain.queries.getListCount.GetListCountQueryHandler;
import io.mateu.core.domain.queries.getListRows.GetListRowsQuery;
import io.mateu.core.domain.queries.getListRows.GetListRowsQueryHandler;
import io.mateu.dtos.Page;
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
  private final OrderingDeserializer orderingDeserializer;

  public FetchListUseCase(
      Serializer serializer,
      GetListRowsQueryHandler getListRowsQueryHandler,
      GetListCountQueryHandler getListCountQueryHandler,
      OrderingDeserializer orderingDeserializer) {
    this.serializer = serializer;
    this.getListRowsQueryHandler = getListRowsQueryHandler;
    this.getListCountQueryHandler = getListCountQueryHandler;
    this.orderingDeserializer = orderingDeserializer;
  }

  public Mono<Page> fetchPage(
      String componentType,
      Map<String, Object> data,
      int page,
      int page_size,
      String searchText,
      Map<String, Object> filters,
      // urlencoded form of orders json serialized
      String ordering,
      ServerHttpRequest serverHttpRequest)
      throws Throwable {
    return getListRowsQueryHandler
        .run(
            new GetListRowsQuery(
                componentType,
                data,
                serverHttpRequest,
                searchText,
                filters,
                page,
                page_size,
                orderingDeserializer.deserialize(ordering)))
        .collectList()
        .zipWith(
            page > 0
                ? Mono.just(-1L)
                : getListCountQueryHandler.run(
                    new GetListCountQuery(componentType, searchText, data, serverHttpRequest)))
        .map(tuple -> new Page(tuple.getT1(), tuple.getT2()));
  }
}
