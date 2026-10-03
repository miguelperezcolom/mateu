package io.mateu.mdd.demovb.infra.in.ui.mastertabs;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;

/** The History tab: a plain page. */
@Title("History")
public class CustomerHistory implements PostHydrationHandler {

  @ReadOnly String customerId;

  @ReadOnly String lastEvent;

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    lastEvent = "Customer " + customerId + " created 2026-01-01";
  }
}
