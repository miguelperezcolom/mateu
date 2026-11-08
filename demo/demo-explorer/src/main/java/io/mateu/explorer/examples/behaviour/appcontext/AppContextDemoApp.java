package io.mateu.explorer.examples.behaviour.appcontext;

import io.mateu.uidl.annotations.App;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;

/**
 * Two application-level context selectors on the app header:
 *
 * <ul>
 *   <li>an ENUM — its constants are the options (few → a compact list);
 *   <li>a {@code LookupOptionsSupplier} — many options: the picker is searchable, filters what it
 *       loaded and asks the server for the rest as you type.
 * </ul>
 *
 * <p>The value picked is kept by the browser and travels with EVERY request; any screen reads it
 * with {@code httpRequest.appContext("<field>")}. Changing it reloads the screen against the new
 * context.
 */
@UI("/apps/app-context")
@Title("App context demo")
@App
public class AppContextDemoApp {

  @AppContext(label = "Year")
  FiscalYear fiscalYear;

  @AppContext(label = "Hotel")
  Hotels hotel;

  @Menu BookingsToday bookings;
}
