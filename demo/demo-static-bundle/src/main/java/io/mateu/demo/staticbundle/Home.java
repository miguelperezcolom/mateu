package io.mateu.demo.staticbundle;

import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/**
 * Home screen (route {@code /}). A plain form: its structure is fully pre-renderable into the bundle,
 * and the {@code assignedTo} select fetches its options CLIENT-SIDE from a public REST API — so this
 * screen shows live data even when served from a static host with NO Mateu backend.
 */
@UI("")
@Title("Static bundle demo")
@Getter
@Setter
public class Home {

  private String name;

  private String notes;

  // Both selects fetch their options directly from the browser — no Mateu backend needed — and neither
  // repeats a URL: they REFERENCE entries of specs/ui/sources.yaml. One of those endpoints is somebody
  // else's and one is ours, which is what the derived contract separates.
  @RestOptions(source = "users")
  private String assignedTo;

  @RestOptions(source = "roomTypes")
  private String roomType;

  // Interpolated into the `reservations` source's url. The url lives in the catalogue and the TYPE
  // lives here, so only reading both lets the derived contract emit this parameter as a date rather
  // than a bare string.
  private java.time.LocalDate arrival;

  @RestOptions(source = "reservations")
  private String reservation;
}
