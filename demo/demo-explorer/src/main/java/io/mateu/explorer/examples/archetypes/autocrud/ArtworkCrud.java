package io.mateu.explorer.examples.archetypes.autocrud;

import io.mateu.core.infra.declarative.orchestrators.crud.AutoCrud;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.data.CrudDisplay;
import io.mateu.uidl.data.Toggle;
import io.mateu.uidl.interfaces.CrudStore;
import io.mateu.uidl.interfaces.Identifiable;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * The {@code AutoCrud} archetype: an entity and a {@link CrudStore} give the whole CRUD — listing
 * with search and filters, view, create, edit, delete. Two options shown here: {@link
 * #editInDrawer} (create and edit in a drawer over the listing) and {@link #display}, the
 * tri-state toggles (on / disabled / off) — "Save and next" switched on, Delete switched off.
 */
@Title("Artworks")
public class ArtworkCrud extends AutoCrud<ArtworkCrud.Artwork> {

  public enum Classification {
    PAINTING,
    SCULPTURE,
    PRINT
  }

  public static class Artwork implements Identifiable {
    public String id;
    @NotEmpty public String title;
    public String artist;
    public Classification classification;
    public int year;

    public Artwork() {}

    Artwork(String id, String title, String artist, Classification classification, int year) {
      this.id = id;
      this.title = title;
      this.artist = artist;
      this.classification = classification;
      this.year = year;
    }

    @Override
    public String id() {
      return id;
    }

    @Override
    public String toString() {
      return title;
    }
  }

  static final List<Artwork> ARTWORKS =
      new ArrayList<>(
          List.of(
              new Artwork("a1", "Water Lilies", "Claude Monet", Classification.PAINTING, 1906),
              new Artwork("a2", "The Great Wave", "Katsushika Hokusai", Classification.PRINT, 1831),
              new Artwork("a3", "The Thinker", "Auguste Rodin", Classification.SCULPTURE, 1904),
              new Artwork("a4", "Melencolia I", "Albrecht Dürer", Classification.PRINT, 1514)));

  @Override
  public boolean editInDrawer() {
    return true;
  }

  @Override
  public CrudDisplay display() {
    return CrudDisplay.defaults().toBuilder().saveAndNext(Toggle.on).delete(Toggle.off).build();
  }

  @Override
  public CrudStore<Artwork> store() {
    return new CrudStore<>() {
      @Override
      public Optional<Artwork> findById(String id) {
        return ARTWORKS.stream().filter(a -> a.id.equals(id)).findFirst();
      }

      @Override
      public String save(Artwork artwork) {
        if (artwork.id == null || artwork.id.isBlank()) {
          artwork.id = UUID.randomUUID().toString().substring(0, 8);
          ARTWORKS.add(artwork);
        } else {
          ARTWORKS.replaceAll(a -> a.id.equals(artwork.id) ? artwork : a);
        }
        return artwork.id;
      }

      @Override
      public List<Artwork> findAll() {
        return ARTWORKS;
      }

      @Override
      public void deleteAllById(List<String> ids) {
        ARTWORKS.removeIf(a -> ids.contains(a.id));
      }
    };
  }
}
