package io.mateu.explorer.examples.behaviour.routeparams;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;

/**
 * One screen, several routes ({@link RateRoutes}). Its fields are filled from the route's
 * parameters, by name, with this precedence: fixed &gt; client state &gt; path &gt; query &gt;
 * defaults.
 */
@Title("Rate quote")
@ReadOnly
public class RateQuote {

  /** from the path: {@code rates/:hotel} */
  String hotel;

  /** a default the query string may override */
  String currency;

  /** a default the query string may override */
  int nights;

  /** PINNED by the route: no query string or doctored state can change it */
  String channel;
}
