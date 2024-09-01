package io.mateu.core.domain.queries.getListRows;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.RpcViewWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;

@Service
@Slf4j
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class GetListRowsQueryHandler {

  private final ReflectionHelper reflectionHelper;
  private final FiltersDeserializer filtersDeserializer;

  public GetListRowsQueryHandler(
      ReflectionHelper reflectionHelper, FiltersDeserializer filtersDeserializer) {
    this.reflectionHelper = reflectionHelper;
    this.filtersDeserializer = filtersDeserializer;
  }

  @Transactional
  public Flux<Object> run(GetListRowsQuery query) throws Throwable {

    Object instance =
        reflectionHelper.newInstance(Class.forName(query.componentType()), query.data());

    if (instance == null) {
      return Flux.empty();
    }

    Listing listing = getListing(instance);

    if (listing == null) {
      return Flux.empty();
    }

    var filters = filtersDeserializer.deserialize(listing, query.data(), query.serverHttpRequest());

    return listing.fetchRows(
        filters, query.ordering(), query.page() * query.pageSize(), query.pageSize());
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
