package io.mateu.core.infra.declarative.orchestrators;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.PageTemplate;
import io.mateu.uidl.annotations.PageType;

/**
 * One class is a crud's record page and its editor: the sub-route types the page — viewing is a
 * detail page, editing or creating a form — unless the class declares its template.
 */
class MultiViewPageTypeTest {

  static class Booking {
    String locator = "QN29HB";
  }

  @PageTemplate(PageType.FORM)
  static class DeclaredForm {
    String locator = "QN29HB";
  }

  @org.junit.jupiter.api.Test
  void viewingARecordIsADetailPageAndEditingOrCreatingItAForm() {
    assertThat(MultiView.pageTypeOfView("view", new Booking())).isEqualTo("detail");
    assertThat(MultiView.pageTypeOfView("edit", new Booking())).isEqualTo("form");
    assertThat(MultiView.pageTypeOfView("new", new Booking())).isEqualTo("form");
  }

  @org.junit.jupiter.api.Test
  void aDeclaredTemplateWins() {
    assertThat(MultiView.pageTypeOfView("view", new DeclaredForm())).isEqualTo("form");
  }

  @org.junit.jupiter.api.Test
  void otherSubRoutesKeepTheInferredType() {
    assertThat(MultiView.pageTypeOfView("list", new Booking())).isEqualTo("form");
  }
}
