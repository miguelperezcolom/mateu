package io.mateu.explorer.examples.behaviour.gridlayouts;

import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;

/** {@code GridLayout.tree}: rows carry a self-referential {@code children} list. */
@Title("Catalogue")
public class Catalogue implements Listing<Catalogue.Category> {

  public record Category(String name, Integer products, List<Category> children) {}

  static Category leaf(String name, int products) {
    return new Category(name, products, List.of());
  }

  @Override
  public ListingData<Category> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(
        List.of(
            new Category(
                "Furniture",
                41,
                List.of(
                    leaf("Chairs", 18),
                    new Category("Tables", 15, List.of(leaf("Dining", 9), leaf("Coffee", 6))),
                    leaf("Shelves", 8))),
            new Category("Lighting", 23, List.of(leaf("Lamps", 14), leaf("Bulbs", 9))),
            leaf("Gift cards", 3)));
  }

  @Override
  public GridLayout gridLayout() {
    return GridLayout.tree;
  }
}
