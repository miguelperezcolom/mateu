package io.mateu.explorer.examples.behaviour.menusincode;

import io.mateu.uidl.data.RouteEntry;
import io.mateu.uidl.interfaces.RouteEntrySupplier;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 * The routes of {@link HotelChainApp}, authored in code: one screen for every hotel. A supplier's
 * routes are absolute (a bean is not tied to a mount), so the entry names the app's mount in front
 * of the {@code hotels/:code} its menu links open.
 */
@Service
public class HotelRoutes implements RouteEntrySupplier {

  @Override
  public List<RouteEntry> routes() {
    return List.of(
        RouteEntry.of("x/behaviour/menus-in-code/hotels/:code", HotelPage.class.getName()));
  }
}
