package io.mateu.explorer.examples.behaviour.menusincode;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.interfaces.TitleSupplier;

/** One page for every hotel; {@code code} comes from the route {@code hotels/:code}. */
@ReadOnly
public class HotelPage implements TitleSupplier {

  String code;

  String rooms = "120";

  @Override
  public String title() {
    return HotelChainApp.HOTELS.stream()
        .filter(h -> h[0].equals(code))
        .map(h -> "Hotel " + h[1])
        .findFirst()
        .orElse("Hotel " + code);
  }
}
