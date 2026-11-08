package io.mateu.explorer.examples.behaviour.routeparams;

import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;

/**
 * Two routes over ONE screen, told apart by a pinned parameter — what an annotation cannot say. In
 * YAML the same entries go in a {@code routes.yaml}; here they are authored in code, by a {@link
 * RouteEntrySupplier} bean (routes.yaml wins over code, code over annotations).
 */
@Service
public class RateRoutes implements RouteEntrySupplier {

  @Override
  public List<RouteEntry> routes() {
    return List.of(
        RouteEntry.builder()
            .route("x/behaviour/route-params/web/:hotel")
            .viewModel(RateQuote.class.getName())
            .fixedParams(Map.of("channel", "web"))
            .defaultParams(Map.of("currency", "EUR", "nights", 1))
            .build(),
        RouteEntry.builder()
            .route("x/behaviour/route-params/agents/:hotel")
            .viewModel(RateQuote.class.getName())
            .fixedParams(Map.of("channel", "travel agents"))
            .defaultParams(Map.of("currency", "EUR", "nights", 1))
            .build());
  }
}
