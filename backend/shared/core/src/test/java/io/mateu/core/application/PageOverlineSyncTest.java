package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Overline;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.TitlePlaceholder;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.interfaces.OverlineSupplier;
import io.mateu.uidl.interfaces.TitlePlaceholderSupplier;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The two remaining text elements of the Redwood canonical page header: {@code overlineText} (the
 * small line ABOVE the title) and {@code pageTitlePlaceholder} (what the header shows while the
 * title is still empty — the create-mode affordance).
 *
 * <p>Both follow the house rule for page metadata: the supplier interface wins over the annotation,
 * and a page declaring neither leaves the wire field null. The placeholder is emitted as declared —
 * suppressing it once a title exists is the renderer's job, so the wire stays descriptive.
 */
class PageOverlineSyncTest {

  @SuppressWarnings("unused")
  @UI("/overlined")
  @Title("Requisition 4471")
  @Overline("Requisitions")
  public static class Overlined {
    String name = "Widget";
  }

  @SuppressWarnings("unused")
  @UI("/overlined-dynamic")
  @Title("Requisition 4471")
  @Overline("ignored when a supplier is present")
  public static class OverlinedDynamic implements OverlineSupplier {
    String name = "Widget";

    @Override
    public String overline() {
      return "Q3 campaign";
    }
  }

  @SuppressWarnings("unused")
  @UI("/new-booking")
  @TitlePlaceholder("New booking…")
  public static class NewBooking {
    String name = "";
  }

  @SuppressWarnings("unused")
  @UI("/new-booking-dynamic")
  public static class NewBookingDynamic implements TitlePlaceholderSupplier {
    String name = "";

    @Override
    public String titlePlaceholder() {
      return "New booking for August…";
    }
  }

  @SuppressWarnings("unused")
  @UI("/plain-header")
  @Title("Plain")
  public static class PlainHeader {
    String name = "Widget";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            Overlined.class,
            OverlinedDynamic.class,
            NewBooking.class,
            NewBookingDynamic.class,
            PlainHeader.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static PageDto pageOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    ServerSideComponentDto server = null;
    for (var fragment : increment.fragments()) {
      if (fragment.component() instanceof ServerSideComponentDto s) {
        server = s;
        break;
      }
    }
    assertThat(server).as("server side component for " + route).isNotNull();
    var pages = new ArrayList<PageDto>();
    FieldKindsSyncTest.walk(server, PageDto.class, pages);
    assertThat(pages).as("page metadata for " + route).isNotEmpty();
    return pages.get(0);
  }

  @Test
  void theOverlineAnnotationTravelsOnTheWire() {
    assertThat(pageOf("/overlined").overline()).isEqualTo("Requisitions");
  }

  @Test
  void theOverlineSupplierWinsOverTheAnnotation() {
    assertThat(pageOf("/overlined-dynamic").overline()).isEqualTo("Q3 campaign");
  }

  @Test
  void theTitlePlaceholderAnnotationTravelsOnTheWire() {
    assertThat(pageOf("/new-booking").titlePlaceholder()).isEqualTo("New booking…");
  }

  @Test
  void theTitlePlaceholderSupplierTravelsOnTheWire() {
    assertThat(pageOf("/new-booking-dynamic").titlePlaceholder())
        .isEqualTo("New booking for August…");
  }

  @Test
  void aPageDeclaringNeitherLeavesBothNull() {
    var page = pageOf("/plain-header");
    assertThat(page.overline()).isNull();
    assertThat(page.titlePlaceholder()).isNull();
  }

  @Test
  void theOverlineDoesNotDisturbTheTitle() {
    assertThat(pageOf("/overlined").title()).isEqualTo("Requisition 4471");
  }
}
