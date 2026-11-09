package io.mateu.explorer.examples.archetypes.collectiondetail;

import io.mateu.core.infra.declarative.orchestrators.collectiondetail.CollectionDetail;
import io.mateu.uidl.data.Card;
import io.mateu.uidl.data.Chip;
import io.mateu.uidl.data.EntityHeader;
import io.mateu.uidl.data.Fact;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.data.VerticalLayout;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import java.util.List;

/**
 * The {@code CollectionDetail} archetype: a searchable card list on the left, the selected item's
 * detail on the right. Selecting a card and typing in the search box both re-render in place.
 */
public class ArtistDirectory extends CollectionDetail<ArtistDirectory.Artist> {

  public record Artist(
      String id, String name, String nationality, String lived, int works, String bio) {}

  static final List<Artist> ARTISTS =
      List.of(
          new Artist("monet", "Claude Monet", "French", "1840–1926", 14,
              "Founder of Impressionism; painted the water lilies of Giverny for thirty years."),
          new Artist("hokusai", "Katsushika Hokusai", "Japanese", "1760–1849", 9,
              "Ukiyo-e master, best known for the Thirty-six Views of Mount Fuji."),
          new Artist("kahlo", "Frida Kahlo", "Mexican", "1907–1954", 3,
              "Self-portraits that mix Mexican folk art with surrealism."),
          new Artist("durer", "Albrecht Dürer", "German", "1471–1528", 22,
              "Painter and printmaker of the Northern Renaissance."));

  @Override
  protected List<Artist> rows(String searchText, HttpRequest httpRequest) {
    var needle = searchText == null ? "" : searchText.toLowerCase();
    return ARTISTS.stream()
        .filter(a -> (a.name() + " " + a.nationality()).toLowerCase().contains(needle))
        .toList();
  }

  @Override
  protected String idOf(Artist artist) {
    return artist.id();
  }

  @Override
  protected String titleOf(Artist artist) {
    return artist.name();
  }

  @Override
  protected String captionOf(Artist artist) {
    return artist.nationality() + " · " + artist.lived();
  }

  @Override
  protected List<Chip> badgesOf(Artist artist) {
    return List.of(Chip.builder().label(artist.works() + " works").build());
  }

  @Override
  protected String listLabel(int count) {
    return count + " artists";
  }

  @Override
  protected Component detail(Artist artist, HttpRequest httpRequest) {
    return Card.builder()
        .content(
            VerticalLayout.builder()
                .spacing(true)
                .content(
                    List.of(
                        EntityHeader.builder()
                            .title(artist.name())
                            .subtitle(artist.nationality() + " artist")
                            .facts(
                                List.of(
                                    Fact.builder().label("Lived").value(artist.lived()).build(),
                                    Fact.builder()
                                        .label("Works in the collection")
                                        .value(String.valueOf(artist.works()))
                                        .build()))
                            .build(),
                        new Text(artist.bio())))
                .build())
        .style("flex: 1;")
        .build();
  }
}
