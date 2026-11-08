package io.mateu.explorer.examples.archetypes.crud;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.Creatable;
import io.mateu.uidl.interfaces.Deletable;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import io.mateu.uidl.interfaces.Navigable;
import io.mateu.uidl.interfaces.Searchable;
import java.util.ArrayList;
import java.util.List;

/**
 * A hand-written CRUD: a {@link Listing} plus the capability interfaces it wants. {@code Crud} is
 * exactly this with every capability ({@code Navigable}, {@code Editable}, {@code Creatable},
 * {@code Deletable}); here only search, view, create and delete are declared — so there is no Edit
 * button, and no route for one. Each capability adds its button and its route, nothing else.
 */
@Title("Lending institutions")
public class LenderListing
    implements Listing<LenderListing.Lender>,
        Searchable,
        Navigable<LenderListing.Lender, String>,
        Creatable<LenderListing.Lender, String>,
        Deletable<String> {

  public record Lender(String id, String name, String city, int activeLoans) {}

  static final List<Lender> LENDERS =
      new ArrayList<>(
          List.of(
              new Lender("smk", "SMK — Statens Museum for Kunst", "Copenhagen", 3),
              new Lender("orsay", "Musée d'Orsay", "Paris", 2),
              new Lender("bm", "British Museum", "London", 1)));

  @Override
  public ListingData<Lender> search(SearchRequest request, HttpRequest httpRequest) {
    var text = request.searchText() == null ? "" : request.searchText().toLowerCase();
    return ListingData.from(
        LENDERS.stream()
            .filter(l -> (l.name() + " " + l.city()).toLowerCase().contains(text))
            .toList());
  }

  @Override
  public Lender view(String id, HttpRequest httpRequest) {
    return LENDERS.stream().filter(l -> l.id().equals(id)).findFirst().orElseThrow();
  }

  @Override
  public Lender creationForm(HttpRequest httpRequest) {
    return new Lender("", "", "", 0);
  }

  @Override
  public String create(HttpRequest httpRequest) {
    var form = httpRequest.getComponentState(Lender.class);
    var id = form.name().toLowerCase().replaceAll("[^a-z]", "");
    LENDERS.add(new Lender(id, form.name(), form.city(), form.activeLoans()));
    return id;
  }

  @Override
  public void deleteAllById(List<String> ids, HttpRequest httpRequest) {
    LENDERS.removeIf(l -> ids.contains(l.id()));
  }
}
