package io.mateu.maven.bundle.fixtures;

import io.mateu.uidl.annotations.RestListing;
import io.mateu.uidl.annotations.RestOptions;
import io.mateu.uidl.annotations.UI;

/**
 * A screen whose data comes from REST endpoints: one this project owes (relative URL) and a third
 * party's (another origin) — the two provenances the derived contract tells apart.
 */
@UI("/catalogue")
@RestListing(url = "/api/catalogue/products?q=${searchText}", itemsPath = "items")
public class CataloguePage {

  @RestOptions(url = "https://countries.example.com/all", valuePath = "code", labelPath = "name")
  public String country;
}
