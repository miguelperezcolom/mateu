package io.mateu.explorer.examples.pagetemplates.collectiondetailpage;

import io.mateu.explorer.examples.pagetemplates.data.MuseumApi;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.PostHydrationHandler;

/**
 * The selected artist of the YAML collection-detail page: {@code id} arrives from the route
 * ({@code …/collection-detail-page/:id}); once it is in, {@link #onHydrated} fills the other fields
 * — the page's {@code state}, which the detail's {@code ${state.name}} reads.
 */
public class ArtistRecord implements PostHydrationHandler {

  public String id;
  public String name;
  public String nationality;
  public String lived;
  public int works;
  public String bio;

  @Override
  public void onHydrated(HttpRequest httpRequest) {
    MuseumApi.artist(id)
        .ifPresent(
            artist -> {
              name = artist.name();
              nationality = artist.nationality();
              lived = artist.lived();
              works = artist.works();
              bio = artist.bio();
            });
  }
}
