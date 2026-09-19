package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The sizing intent (coherence-plan #8, Phase 3): a listing/table declares "fill" — it grows to
 * take the space its parent leaves and scrolls internally rather than pushing the page. This pins
 * that the intent reaches the wire on the listing's component envelope; the frontend maps it to a
 * flex-grow (applySizing / sizing.test.ts).
 */
class SizingSyncTest {

  public record Book(String id, String title) {}

  @SuppressWarnings("unused")
  @UI("/sizing-books")
  public static class Books implements Listing<Book> {
    @Override
    public ListingData<Book> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(List.of(new Book("1", "Dune")));
    }
  }

  // An explicit @Size on a ComponentTreeSupplier sizes its whole surface (the full-canvas case).
  @SuppressWarnings("unused")
  @UI("/sizing-fill-canvas")
  @io.mateu.uidl.annotations.Size(io.mateu.uidl.annotations.SizeMode.fill)
  public static class FillCanvas implements io.mateu.uidl.interfaces.ComponentTreeSupplier {
    @Override
    public io.mateu.uidl.fluent.Component component(HttpRequest httpRequest) {
      return new io.mateu.uidl.data.Text("canvas", "a full-canvas screen");
    }
  }

  @SuppressWarnings("unused")
  @UI("/sizing-fixed-panel")
  @io.mateu.uidl.annotations.Size(
      value = io.mateu.uidl.annotations.SizeMode.fixed,
      length = "15rem")
  public static class FixedPanel implements io.mateu.uidl.interfaces.ComponentTreeSupplier {
    @Override
    public io.mateu.uidl.fluent.Component component(HttpRequest httpRequest) {
      return new io.mateu.uidl.data.Text("panel", "a fixed-width panel");
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Books.class, FillCanvas.class, FixedPanel.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aListingComponentCarriesTheFillSizingIntent() {
    var increment = mateu.sync("/sizing-books");
    var listingEnvelope = findListingEnvelope(increment);
    assertThat(listingEnvelope).as("the listing's component envelope is on the wire").isNotNull();
    assertThat(listingEnvelope.sizing())
        .as("a listing fills the space its parent leaves and scrolls internally")
        .isEqualTo("fill");
  }

  @Test
  void anExplicitSizeFillOnAViewSizesItsSurface() {
    var leaf = findById(mateu.sync("/sizing-fill-canvas"), "canvas");
    assertThat(leaf).as("the view's component leaf is on the wire").isNotNull();
    assertThat(leaf.sizing()).isEqualTo("fill");
  }

  @Test
  void anExplicitSizeFixedCarriesItsLength() {
    var leaf = findById(mateu.sync("/sizing-fixed-panel"), "panel");
    assertThat(leaf).isNotNull();
    assertThat(leaf.sizing()).isEqualTo("fixed:15rem");
  }

  /** The ClientSideComponentDto with the given id. */
  private static ClientSideComponentDto findById(UIIncrementDto increment, String id) {
    var found = new ArrayList<ClientSideComponentDto>();
    increment.fragments().forEach(f -> collectById(f.component(), id, found));
    return found.isEmpty() ? null : found.get(0);
  }

  private static void collectById(
      ComponentDto node, String id, List<ClientSideComponentDto> found) {
    if (node == null) {
      return;
    }
    if (node instanceof ClientSideComponentDto client && id.equals(client.id())) {
      found.add(client);
    }
    node.children().forEach(child -> collectById(child, id, found));
  }

  /** The ClientSideComponentDto whose metadata is the CrudlDto (the listing). */
  private static ClientSideComponentDto findListingEnvelope(UIIncrementDto increment) {
    var found = new ArrayList<ClientSideComponentDto>();
    increment.fragments().forEach(f -> collectListing(f.component(), found));
    return found.isEmpty() ? null : found.get(0);
  }

  private static void collectListing(ComponentDto node, List<ClientSideComponentDto> found) {
    if (node == null) {
      return;
    }
    if (node instanceof ClientSideComponentDto client && client.metadata() instanceof CrudlDto) {
      found.add(client);
    }
    if (node != null) {
      node.children().forEach(child -> collectListing(child, found));
    }
  }
}
