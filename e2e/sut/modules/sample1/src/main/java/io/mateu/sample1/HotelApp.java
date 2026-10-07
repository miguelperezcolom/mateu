package io.mateu.sample1;

import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/** An app shell around {@link StaysListing}: the not-found page renders inside it. */
@UI("/hotel")
@Title("Hotel")
public class HotelApp {

  @Menu StaysListing stays;
}
