package com.acme.pms.ui;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/** One of the application's own screens, next to EventConductor's. */
@Title("Front desk")
@ReadOnly
public class FrontDesk {

  String hotel = "Acme Palma";

  int arrivalsToday = 42;
}
