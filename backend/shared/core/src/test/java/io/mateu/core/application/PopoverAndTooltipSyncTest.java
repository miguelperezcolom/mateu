package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.CrudlDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.PopoverDto;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.Tooltip;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.ListingData;
import io.mateu.uidl.data.Popover;
import io.mateu.uidl.data.PopoverTrigger;
import io.mateu.uidl.data.SearchRequest;
import io.mateu.uidl.data.Text;
import io.mateu.uidl.fluent.Component;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.Listing;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Hover details: a {@code Popover} carries its trigger (click by default, hover for read-only
 * details) and its own id, and {@code @Tooltip("otherField")} on a listing row field makes its cell
 * show another field of the row on hover (the column's tooltipPath).
 */
class PopoverAndTooltipSyncTest {

  @SuppressWarnings("unused")
  @UI("/hover-popover")
  @Title("Rate")
  public static class RatePage {
    @Label("")
    Callable<Component> rate =
        () ->
            Popover.builder()
                .id("rateInfo")
                .trigger(PopoverTrigger.hover)
                .wrapped(new Text("rateLink", "BAR 134 €"))
                .content(new Text("rateBreakdown", "Sat 10: 134 € · Sun 11: 120 €"))
                .build();

    @Label("")
    Callable<Component> legacy =
        () -> new Popover(new Text("c", "content"), new Text("w", "wrapped"), "", "");
  }

  public record Stay(
      String id, String guest, @Tooltip("breakdown") double rate, @Hidden String breakdown) {}

  @UI("/hover-tooltip")
  public static class Stays implements Listing<Stay> {
    @Override
    public ListingData<Stay> search(SearchRequest request, HttpRequest httpRequest) {
      return ListingData.of(List.of(new Stay("1", "Brown", 134, "Sat 10: 134 €\nSun 11: 120 €")));
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(RatePage.class, Stays.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  @Test
  void aPopoverCarriesItsTriggerAndId() {
    var increment = mateu.sync("/hover-popover");
    var popovers =
        FieldKindsSyncTest.collect(increment.fragments().get(0).component(), PopoverDto.class);
    assertThat(popovers).extracting(PopoverDto::trigger).containsExactly("hover", "click");
  }

  @Test
  void aTooltipColumnPointsAtTheOtherField() {
    var increment = mateu.sync("/hover-tooltip");
    var crudls = new ArrayList<CrudlDto>();
    increment
        .fragments()
        .forEach(f -> FieldKindsSyncTest.walk(f.component(), CrudlDto.class, crudls));
    assertThat(crudls).isNotEmpty();
    var columns = new ArrayList<GridColumnDto>();
    crudls.get(0).columns().forEach(c -> FieldKindsSyncTest.walk(c, GridColumnDto.class, columns));
    assertThat(columns)
        .filteredOn(c -> "rate".equals(c.id()))
        .extracting(GridColumnDto::tooltipPath)
        .containsExactly("breakdown");
  }
}
