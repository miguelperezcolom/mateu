package io.mateu.explorer.examples.behaviour.interpolation;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.Message;

/**
 * {@code ${…}} in a label or title is an expression over the live {@code state} (and {@code
 * data}), evaluated in the browser: section titles, field labels, button labels, tabs, banners…
 * follow the form as it is typed.
 */
@Title("Room rate")
public class RoomRate {

  @Section("Rate for ${state.guest || 'a guest'}")
  String guest = "Ada";

  String currency = "EUR";

  @Section("Stay")
  @Label("Price per night (${state.currency})")
  double price = 120;

  int nights = 3;

  @Button
  @Label("Charge ${state.nights} nights")
  Message charge() {
    return Message.success(guest + " pays " + (price * nights) + " " + currency);
  }
}
