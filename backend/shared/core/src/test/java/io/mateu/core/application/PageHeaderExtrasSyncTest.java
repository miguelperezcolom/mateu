package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The page header carries a "last updated" timestamp (the Oracle Redwood timestamp header element)
 * from a {@code @Timestamp} field: its value travels on {@code PageDto.timestamp} (with the
 * optional label prefix), the field is excluded from the form body, and a page with no such field
 * leaves {@code timestamp} null.
 */
class PageHeaderExtrasSyncTest {

  @SuppressWarnings("unused")
  @UI("/stamped")
  @Title("Stamped record")
  public static class Stamped {
    String name = "Widget";

    @Timestamp("Last updated")
    String updatedAt = "2026-07-20 12:00";
  }

  @SuppressWarnings("unused")
  @UI("/stamped-bare")
  @Title("Bare stamp")
  public static class BareStamp {
    String name = "Widget";

    @Timestamp String updatedAt = "just now";
  }

  @SuppressWarnings("unused")
  @UI("/unstamped")
  @Title("No stamp")
  public static class Unstamped {
    String name = "Widget";
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Stamped.class, BareStamp.class, Unstamped.class);
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
  void theTimestampFieldTravelsWithItsLabelPrefix() {
    assertThat(pageOf("/stamped").timestamp()).isEqualTo("Last updated 2026-07-20 12:00");
  }

  @Test
  void aBareTimestampTravelsAsJustTheValue() {
    assertThat(pageOf("/stamped-bare").timestamp()).isEqualTo("just now");
  }

  @Test
  void aPageWithoutATimestampFieldLeavesItNull() {
    assertThat(pageOf("/unstamped").timestamp()).isNull();
  }

  @Test
  void theTimestampFieldIsExcludedFromTheFormBody() {
    var fields = new ArrayList<FormFieldDto>();
    UIIncrementDto increment = mateu.sync("/stamped");
    for (var fragment : increment.fragments()) {
      FieldKindsSyncTest.walk(fragment.component(), FormFieldDto.class, fields);
    }
    assertThat(fields).extracting(FormFieldDto::fieldId).doesNotContain("updatedAt");
  }
}
