package io.mateu.core.domain.queries.getListCount;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.outbound.metadataBuilders.RpcViewWrapper;
import io.mateu.core.domain.model.reflection.ReflectionHelper;
import io.mateu.core.domain.model.util.Serializer;
import io.mateu.core.domain.queries.FiltersDeserializer;
import io.mateu.core.domain.uidefinition.shared.interfaces.Listing;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@Slf4j
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class GetListCountQueryHandler {

  private final ReflectionHelper reflectionHelper;
  private final Serializer serializer;
  private final FiltersDeserializer filtersDeserializer;

  public GetListCountQueryHandler(
      ReflectionHelper reflectionHelper,
      Serializer serializer,
      FiltersDeserializer filtersDeserializer) {
    this.reflectionHelper = reflectionHelper;
    this.serializer = serializer;
    this.filtersDeserializer = filtersDeserializer;
  }

  public Mono<Long> run(GetListCountQuery query) throws Throwable {

    Object instance = reflectionHelper.newInstance(Class.forName(query.componentType()), query.data());

    Listing listing = null;
    if (instance instanceof Listing instanceAsListing) {
      listing = instanceAsListing;
    } else if (instance instanceof RpcViewWrapper rpcViewWrapper) {
      listing = rpcViewWrapper.getRpcView();
    }

    var filters = filtersDeserializer.deserialize(listing, query.data(), query.serverHttpRequest());

    return listing.fetchCount(filters);
  }
}
