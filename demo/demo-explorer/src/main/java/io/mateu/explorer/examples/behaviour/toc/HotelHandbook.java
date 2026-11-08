package io.mateu.explorer.examples.behaviour.toc;

import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toc;
import io.mateu.uidl.data.FieldStereotype;

/**
 * A long "docs-style" page. {@code @Toc} shows a sticky index of the section titles on the right:
 * a click scrolls to the section, the entry in view is highlighted, and Ctrl+Alt+1…9 jump to the
 * first nine. Without {@code @Toc} the index appears by itself from five stacked sections ({@code
 * @Toc(false)} suppresses it). {@code @Section(sticky = true)} pins a section while the rest
 * scrolls.
 */
@Title("Hotel handbook")
@Toc
public class HotelHandbook {

  @Section(value = "Arrival", sticky = true)
  String checkInFrom = "15:00";

  @Section("Rooms")
  @Stereotype(FieldStereotype.textarea)
  String rooms = text("Rooms");

  @Section("Restaurant")
  @Stereotype(FieldStereotype.textarea)
  String restaurant = text("Restaurant");

  @Section("Spa")
  @Stereotype(FieldStereotype.textarea)
  String spa = text("Spa");

  @Section("Excursions")
  @Stereotype(FieldStereotype.textarea)
  String excursions = text("Excursions");

  @Section("Departure")
  @Stereotype(FieldStereotype.textarea)
  String departure = text("Departure");

  static String text(String topic) {
    return (topic + " — guidelines for the front desk. ").repeat(25);
  }
}
