package io.mateu.demo.starwars6;

import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import lombok.Getter;
import lombok.Setter;

/**
 * The one screen (route {@code /}). A plain form whose STRUCTURE is fully pre-rendered into the
 * bundle at build time, and whose two selects fetch their options CLIENT-SIDE from the external Star
 * Wars API — so the screen shows live data even when served from a static host with NO Mateu backend.
 *
 * <p>Both selects REFERENCE named entries of {@code specs/ui/sources.yaml} rather than repeating a
 * url; the catalogue travels in the bundle's {@code manifest.json}, so re-pointing the deployment at
 * another environment is an edit of that table, not a rebuild.
 */
@UI("")
@Title("Star Wars — static bundle")
@Getter
@Setter
public class Home {

  private String name;

  @RestOptions(source = "swapi-planets")
  private String homeworld;

  @RestOptions(source = "swapi-people")
  private String mentor;
}
