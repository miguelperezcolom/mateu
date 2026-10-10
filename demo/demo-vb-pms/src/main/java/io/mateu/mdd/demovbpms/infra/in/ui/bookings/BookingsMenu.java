package io.mateu.mdd.demovbpms.infra.in.ui.bookings;

import io.mateu.uidl.annotations.Menu;

/** Section "Bookings" (OPERA Cloud 26.3 user guide, chapter 003). */
public class BookingsMenu {

  @Menu ReservationSearch reservations;

  @Menu RoomDiary roomDiary;

  @Menu PropertyAvailability propertyAvailability;

  @Menu NewReservation newReservation;

  @Menu SalesMap salesMap;

  @Menu ReservationDetail reservation;

  @Menu(display = io.mateu.uidl.data.MenuDisplay.cards)
  QuickAccess quickAccess;
}
