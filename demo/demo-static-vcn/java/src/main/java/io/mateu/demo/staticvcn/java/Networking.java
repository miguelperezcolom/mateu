package io.mateu.demo.staticvcn.java;

import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Menu;
import io.mateu.uidl.annotations.RestSource;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.HomeRouteSupplier;

/**
 * The app shell, authored in Java, and the EXTERNAL API's endpoints, named once ({@code
 * @RestSource}). Every source is DIRECT — the browser calls it itself, so the API must answer with
 * CORS — because a static bundle has no server to proxy through; {@code mateu:bundle} with {@code
 * staticOnly} fails the build if a proxied source or a {@code ${secret.…}} sneaks in.
 *
 * <p>Re-pointing the deployment at another API is an edit of {@code sources} in the exported
 * {@code manifest.json}, not a rebuild.
 */
@UI("")
@Title("Networking (static)")
@RestSource(
    name = "vcns",
    url = "http://localhost:8790/api/vcns",
    description = "Virtual cloud networks")
@RestSource(
    name = "vcn",
    url = "http://localhost:8790/api/vcns/${state.id}",
    description = "One VCN by id")
@RestSource(
    name = "vcn-subnets",
    url = "http://localhost:8790/api/vcns/${state.id}/subnets",
    description = "The subnets of one VCN")
@RestSource(
    name = "vcn-delete",
    url = "http://localhost:8790/api/vcns/${state.id}",
    method = "DELETE",
    description = "Delete a VCN")
public class Networking implements HomeRouteSupplier {

  @Menu
  @Label("Virtual cloud networks")
  Vcns vcns;

  /** The shell opens on the listing. */
  @Override
  public String homeRoute() {
    return "vcns";
  }
}
