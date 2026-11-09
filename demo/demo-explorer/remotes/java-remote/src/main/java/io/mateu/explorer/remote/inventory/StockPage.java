package io.mateu.explorer.remote.inventory;

import io.mateu.uidl.annotations.Button;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

/** A screen of the remote. Its action runs HERE, called by the browser directly (not via the shell). */
@Title("Stock")
public class StockPage {

  @ReadOnly String warehouse = "Madrid central";

  @ReadOnly String servedBy = "the Java remote (explorer-java-remote)";

  @ReadOnly int reserved;

  @ReadOnly String lastAction = "-";

  @Button
  public void reserveOne() {
    reserved++;
    lastAction = "reserved at " + LocalTime.now().truncatedTo(ChronoUnit.SECONDS);
  }
}
