package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.LabelsAsideMode;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import java.util.ArrayList;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Labels-aside inference (the dense backoffice data-entry idiom): labels sit left of the field only
 * for dense single-column forms of short-labelled, single-line widgets — multi-column forms, few
 * fields, long labels and tall widgets keep labels on top. The explicit
 * {@code @FormLayout(labelsAside = ASIDE|TOP)} always wins over the inference.
 */
class LabelsAsideInferenceSyncTest {

  // ---------------------------------------------------------------- fixtures

  @SuppressWarnings("unused")
  @UI("/aside-form")
  @Title("Aside")
  @FormLayout(columns = 1)
  public static class AsideForm {
    String firstName;
    String lastName;
    String email;
    String phone;
    String city;
    String country;
  }

  @SuppressWarnings("unused")
  @UI("/multi-form")
  @Title("Multi")
  @FormLayout(columns = 2)
  public static class MultiColumnForm extends AsideForm {}

  @SuppressWarnings("unused")
  @UI("/small-form")
  @Title("Small")
  @FormLayout(columns = 1)
  public static class SmallForm {
    String firstName;
    String lastName;
    String email;
  }

  @SuppressWarnings("unused")
  @UI("/long-label-form")
  @Title("Long")
  @FormLayout(columns = 1)
  public static class LongLabelForm {
    String firstName;
    String lastName;
    String email;
    String phone;
    String city;

    @Label("Security deposit reference")
    String deposit;
  }

  @SuppressWarnings("unused")
  @UI("/textarea-form")
  @Title("Text")
  @FormLayout(columns = 1)
  public static class TextareaForm {
    String firstName;
    String lastName;
    String email;
    String phone;
    String city;

    @Stereotype(FieldStereotype.textarea)
    String notes;
  }

  @SuppressWarnings("unused")
  @UI("/forced-aside")
  @Title("Forced aside")
  @FormLayout(columns = 2, labelsAside = LabelsAsideMode.ASIDE)
  public static class ForcedAsideForm extends AsideForm {}

  @SuppressWarnings("unused")
  @UI("/forced-top")
  @Title("Forced top")
  @FormLayout(columns = 1, labelsAside = LabelsAsideMode.TOP)
  public static class ForcedTopForm extends AsideForm {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            AsideForm.class,
            MultiColumnForm.class,
            SmallForm.class,
            LongLabelForm.class,
            TextareaForm.class,
            ForcedAsideForm.class,
            ForcedTopForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ---------------------------------------------------------------- assertions

  private static boolean labelsAsideOf(String route) {
    UIIncrementDto increment = mateu.sync(route);
    var layouts = new ArrayList<FormLayoutDto>();
    FieldKindsSyncTest.walk(increment.fragments().get(0).component(), FormLayoutDto.class, layouts);
    assertThat(layouts).isNotEmpty();
    return layouts.get(0).labelsAside();
  }

  @Test
  void denseSingleColumnFormWithShortLabelsGetsLabelsAside() {
    assertThat(labelsAsideOf("/aside-form")).isTrue();
  }

  @Test
  void multiColumnFormKeepsLabelsOnTop() {
    assertThat(labelsAsideOf("/multi-form")).isFalse();
  }

  @Test
  void aFormWithFewFieldsKeepsLabelsOnTop() {
    assertThat(labelsAsideOf("/small-form")).isFalse();
  }

  @Test
  void aLongLabelSendsTheWholeFormBackToTop() {
    assertThat(labelsAsideOf("/long-label-form")).isFalse();
  }

  @Test
  void aTextareaSendsTheWholeFormBackToTop() {
    assertThat(labelsAsideOf("/textarea-form")).isFalse();
  }

  @Test
  void explicitAsideWinsOverTheMultiColumnRule() {
    assertThat(labelsAsideOf("/forced-aside")).isTrue();
  }

  @Test
  void explicitTopWinsOverTheInference() {
    assertThat(labelsAsideOf("/forced-top")).isFalse();
  }
}
