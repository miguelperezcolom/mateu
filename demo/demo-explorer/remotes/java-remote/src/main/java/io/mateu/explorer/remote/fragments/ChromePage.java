package io.mateu.explorer.remote.fragments;

import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Subtitle;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Toolbar;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.Message;

/**
 * A full PAGE of the remote — title, subtitle, a toolbar action, and it sets the window title.
 * Embedded as a micro frontend it is a block of the host's page, and {@code chrome} says how much
 * of that page it keeps: NONE (no header at all), COMPACT (only the actions), PAGE (everything but
 * the breadcrumb). The window title / favicon / history commands are always dropped.
 */
@UI("/mf-page")
@Title("Shipments")
@Subtitle("A remote page with its own header")
public class ChromePage {

  @ReadOnly String inTransit = "12 shipments";

  @Toolbar
  public Message refresh() {
    return new Message("Refreshed by the remote");
  }
}
