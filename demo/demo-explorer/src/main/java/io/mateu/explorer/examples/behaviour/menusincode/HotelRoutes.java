package io.mateu.explorer.examples.behaviour.menusincode;

import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import org.springframework.stereotype.Service;

/** The routes of {@link HotelChainApp}, authored in code: one screen for every hotel. */
@Service
public class HotelRoutes implements RouteEntrySupplier {

  @Override
  public List<RouteEntry> routes() {
    return List.of(RouteEntry.of("hotels/:code", HotelPage.class.getName()));
  }
}
