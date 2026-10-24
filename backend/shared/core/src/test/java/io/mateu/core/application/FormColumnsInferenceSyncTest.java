package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.domain.out.componentmapper.PageFormBuilder;
import io.mateu.core.infra.declarative.orchestrators.wizard.Wizard;
import io.mateu.core.infra.declarative.orchestrators.wizard.WizardStep;
import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormLayoutDto;
import io.mateu.uidl.annotations.AppContext;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.EyesOnly;
import io.mateu.uidl.annotations.FormLayout;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.KPI;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Timestamp;
import io.mateu.uidl.annotations.Title;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.WizardCompletionAction;
import io.mateu.uidl.annotations.Zone;
import io.mateu.uidl.annotations.Zones;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * The inferred form column count: ONE column up to 6 visible fields, TWO from 7 on — counted over
 * the whole form, over the fields that render as form fields. Declarations
 * ({@code @FormLayout(columns)}, {@code @Section(columns)}, {@code @Zones}) always win, each wizard
 * step is its own form, and an inferred single column keeps labels on top (labels-aside stays the
 * idiom of a DECLARED single column).
 */
class FormColumnsInferenceSyncTest {

  // ---------------------------------------------------------------- fixtures

  public static class One {
    public String f1 = "a";
  }

  public static class Two extends One {
    public String f2 = "b";
  }

  public static class Three extends Two {
    public String f3 = "c";
  }

  public static class Four extends Three {
    public String f4 = "d";
  }

  public static class Five extends Four {
    public String f5 = "e";
  }

  /** Six short-labelled single-line fields: dense enough for labels aside — were it declared. */
  @UI("/cols-six")
  @Title("Six")
  public static class Six extends Five {
    public String f6 = "f";
  }

  @UI("/cols-seven")
  @Title("Seven")
  public static class Seven extends Six {
    public String f7 = "g";
  }

  /** Six visible fields plus everything that never renders as a form field. */
  @SuppressWarnings("unused")
  @UI("/cols-six-plus-excluded")
  @Title("Excluded")
  public static class SixPlusExcluded extends Six {
    @Hidden public String hidden = "h";
    @KPI public String kpi = "k";
    @BadgeInHeader public String badge = "b";

    @Timestamp("Updated")
    public String updated = "now";

    @AppContext public String hotel;
    public Callable<Object> island = () -> null;
  }

  /** A permission-dependent field still counts: one class gets one layout, whoever looks. */
  @UI("/cols-six-plus-eyes-only")
  @Title("EyesOnly")
  public static class SixPlusEyesOnly extends Six {
    @EyesOnly(roles = "admin")
    public String secret = "s";
  }

  /** Seven fields across two sections: the count is over the WHOLE form. */
  @SuppressWarnings("unused")
  @UI("/cols-sections")
  @Title("Sections")
  public static class SevenInSections {
    @Section("A")
    public String a1 = "";

    public String a2 = "";
    public String a3 = "";

    @Section("B")
    public String b1 = "";

    public String b2 = "";
    public String b3 = "";
    public String b4 = "";
  }

  @UI("/cols-declared-two")
  @Title("Declared two")
  @FormLayout(columns = 2)
  public static class DeclaredTwo extends Three {}

  @UI("/cols-declared-one")
  @Title("Declared one")
  @FormLayout(columns = 1)
  public static class DeclaredOne extends Seven {}

  /** A section's own columns win over the inferred count; the other section keeps the inferred. */
  @SuppressWarnings("unused")
  @UI("/cols-section-declared")
  @Title("Section declared")
  public static class SectionDeclared {
    @Section(value = "A", columns = 3)
    public String a1 = "";

    @Section("B")
    public String b1 = "";
  }

  /** A zoned form is a declared layout: its sections keep the classic 2. */
  @SuppressWarnings("unused")
  @UI("/cols-zones")
  @Title("Zones")
  @Zones({@Zone(name = "left", width = "50%"), @Zone(name = "right", width = "50%")})
  public static class Zoned {
    @Section(value = "L", zone = "left")
    public String l1 = "";

    @Section(value = "R", zone = "right")
    public String r1 = "";
  }

  /** Six short-labelled fields in a section DECLARED single-column: that one does go aside. */
  @SuppressWarnings("unused")
  @UI("/cols-section-one")
  @Title("Section one")
  public static class SectionDeclaredOne {
    @Section(value = "A", columns = 1)
    public String f1 = "";

    public String f2 = "";
    public String f3 = "";
    public String f4 = "";
    public String f5 = "";
    public String f6 = "";
  }

  public static class ShortStep implements WizardStep {
    public String a = "";
    public String b = "";
  }

  public static class Result implements WizardStep {
    public String outcome = "ok";
  }

  @SuppressWarnings("unused")
  @UI("/cols-wizard-short")
  @Title("Short wizard")
  public static class ShortWizard extends Wizard {
    @Label("Short")
    ShortStep first = new ShortStep();

    @Label("Long")
    Seven second = new Seven();

    Result result;

    @WizardCompletionAction
    Object finish() {
      return null;
    }
  }

  @SuppressWarnings("unused")
  @UI("/cols-wizard-long")
  @Title("Long wizard")
  public static class LongWizard extends Wizard {
    @Label("Long")
    SevenStep first = new SevenStep();

    @Label("Short")
    ShortStep second = new ShortStep();

    Result result;

    @WizardCompletionAction
    Object finish() {
      return null;
    }
  }

  public static class SevenStep extends Seven implements WizardStep {}

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            Six.class,
            Seven.class,
            SixPlusExcluded.class,
            SixPlusEyesOnly.class,
            SevenInSections.class,
            DeclaredTwo.class,
            DeclaredOne.class,
            SectionDeclared.class,
            Zoned.class,
            SectionDeclaredOne.class,
            ShortWizard.class,
            LongWizard.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static List<FormLayoutDto> layoutsOf(String route) {
    var layouts = new ArrayList<FormLayoutDto>();
    FieldKindsSyncTest.walk(
        mateu.sync(route).fragments().get(0).component(), FormLayoutDto.class, layouts);
    assertThat(layouts).as("form layouts of %s", route).isNotEmpty();
    return layouts;
  }

  private static List<Integer> columnsOf(String route) {
    return layoutsOf(route).stream().map(FormLayoutDto::maxColumns).toList();
  }

  // ---------------------------------------------------------------- the threshold

  @ParameterizedTest
  @ValueSource(classes = {One.class, Two.class, Three.class, Four.class, Five.class, Six.class})
  void upToSixVisibleFieldsIsOneColumn(Class<?> form) {
    assertThat(PageFormBuilder.getFormColumns(form)).isEqualTo(1);
  }

  @Test
  void sevenVisibleFieldsAreTwoColumns() {
    assertThat(PageFormBuilder.getFormColumns(Seven.class)).isEqualTo(2);
  }

  @Test
  void theWireCarriesTheInferredCount() {
    assertThat(columnsOf("/cols-six")).containsOnly(1);
    assertThat(columnsOf("/cols-seven")).containsOnly(2);
  }

  // ---------------------------------------------------------------- the counting

  @Test
  void fieldsThatNeverRenderAsFormFieldsDoNotCount() {
    assertThat(columnsOf("/cols-six-plus-excluded")).containsOnly(1);
  }

  @Test
  void aPermissionDependentFieldCountsWhoeverLooks() {
    // the anonymous caller does not see the secret field, yet the layout is the class's
    assertThat(columnsOf("/cols-six-plus-eyes-only")).containsOnly(2);
  }

  @Test
  void theCountIsOverTheWholeFormSoEverySectionSharesIt() {
    assertThat(columnsOf("/cols-sections")).hasSize(2).containsOnly(2);
  }

  // ---------------------------------------------------------------- declarations win

  @Test
  void anExplicitFormLayoutWins() {
    assertThat(columnsOf("/cols-declared-two")).containsOnly(2);
    assertThat(columnsOf("/cols-declared-one")).containsOnly(1);
  }

  @Test
  void anExplicitSectionColumnsWinsAndTheOtherSectionsKeepTheInferredCount() {
    assertThat(columnsOf("/cols-section-declared")).containsExactly(3, 1);
  }

  @Test
  void aZonedFormKeepsTwo() {
    assertThat(columnsOf("/cols-zones")).containsOnly(2);
  }

  // ---------------------------------------------------------------- wizard steps

  @Test
  void eachWizardStepIsItsOwnForm() {
    assertThat(columnsOf("/cols-wizard-short")).containsOnly(1);
    assertThat(columnsOf("/cols-wizard-long")).containsOnly(2);
  }

  // ---------------------------------------------------------------- labels aside

  @Test
  void anInferredSingleColumnKeepsLabelsOnTop() {
    // six short-labelled single-line fields in one column would go aside IF declared
    var layouts = layoutsOf("/cols-six");
    assertThat(layouts).allSatisfy(l -> assertThat(l.labelsAside()).isFalse());
  }

  @Test
  void aDeclaredSingleColumnStillGetsLabelsAside() {
    assertThat(layoutsOf("/cols-declared-one").get(0).labelsAside()).isTrue();
    assertThat(layoutsOf("/cols-section-one").get(0).labelsAside()).isTrue();
  }
}
