package io.mateu.core.domain.queries.getListRows;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.RpcViewWrapper;
import io.mateu.core.domain.model.reflection.ReflectionService;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.dtos.SortType;
import io.mateu.uidl.interfaces.Listing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class GetListRowsQueryHandler {

  private final ReflectionService reflectionService;
  private final FiltersDeserializer filtersDeserializer;

  public GetListRowsQueryHandler(
      ReflectionService reflectionService, FiltersDeserializer filtersDeserializer) {
    this.reflectionService = reflectionService;
    this.filtersDeserializer = filtersDeserializer;
  }

  @Transactional
  public Mono<Page<Object>> run(GetListRowsQuery query) throws Throwable {

    Object instance =
        reflectionService.newInstance(Class.forName(query.componentType()), query.data());

    if (instance == null) {
      return Mono.empty();
    }

    Listing listing = getListing(instance);

    if (listing == null) {
      return Mono.empty();
    }

    var filters = filtersDeserializer.deserialize(listing, query.data(), query.serverHttpRequest());
    String searchText = query.searchText();
    Sort sort = Sort.unsorted();
    query
        .ordering()
        .forEach(
            s -> {
              sort.and(
                  Sort.by(
                      SortType.Descending.equals(s.getOrder())
                          ? Sort.Direction.DESC
                          : Sort.Direction.ASC,
                      s.getColumn()));
            });

    var pageable = PageRequest.of(query.page(), query.pageSize(), sort);

    return listing.fetchRows(searchText, filters, pageable);
  }

  private Listing getListing(Object instance) {
    if (instance instanceof Listing instanceAsListing) {
      return instanceAsListing;
    } else if (instance instanceof RpcViewWrapper rpcViewWrapper) {
      return rpcViewWrapper.getRpcView();
    }
    return null;
  }
}
