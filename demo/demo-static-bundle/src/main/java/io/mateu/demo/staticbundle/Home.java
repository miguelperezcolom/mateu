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

  // Options fetched directly by the browser from a public, CORS-open API — no Mateu backend needed.
  @RestOptions(url = "https://jsonplaceholder.typicode.com/users", valuePath = "id", labelPath = "name")
  private String assignedTo;
}
