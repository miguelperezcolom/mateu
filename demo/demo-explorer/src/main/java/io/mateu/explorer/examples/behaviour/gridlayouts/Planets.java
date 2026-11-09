package io.mateu.explorer.examples.behaviour.gridlayouts;

import io.mateu.uidl.annotations.Priority;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.fluent.GridLayout;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.List;

/**
 * The same eight rows; each subclass only answers {@code gridLayout()}. Undeclared means a table —
 * a listing that wants to be something else says which.
 */
public abstract class Planets implements Listing<Planets.Planet> {

  /**
   * {@code @Priority} says which columns matter most: the identifier is a list item's or a card's
   * title, priority 1–2 its caption; the rest only show in the table and the detail.
   */
  public record Planet(
      @Priority(value = 1, identifier = true) String name,
      @Priority(2) String type,
      Double distanceAu,
      Integer moons) {}

  static final List<Planet> PLANETS =
      List.of(
          new Planet("Mercury", "Rocky", 0.39, 0),
          new Planet("Venus", "Rocky", 0.72, 0),
          new Planet("Earth", "Rocky", 1.0, 1),
          new Planet("Mars", "Rocky", 1.52, 2),
          new Planet("Jupiter", "Gas giant", 5.2, 95),
          new Planet("Saturn", "Gas giant", 9.54, 146),
          new Planet("Uranus", "Ice giant", 19.2, 28),
          new Planet("Neptune", "Ice giant", 30.06, 16));

  @Override
  public ListingData<Planet> search(SearchRequest request, HttpRequest httpRequest) {
    return ListingData.from(PLANETS);
  }

  @Title("Planets as cards")
  public static class AsCards extends Planets {
    @Override
    public GridLayout gridLayout() {
      return GridLayout.cards;
    }
  }

  @Title("Planets as a list")
  public static class AsList extends Planets {
    @Override
    public GridLayout gridLayout() {
      return GridLayout.list;
    }
  }

  @Title("Planets, master / detail")
  public static class AsMasterDetail extends Planets {
    @Override
    public GridLayout gridLayout() {
      return GridLayout.masterDetail;
    }
  }
}
