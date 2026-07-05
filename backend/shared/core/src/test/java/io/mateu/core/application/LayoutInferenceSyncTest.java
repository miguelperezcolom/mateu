package io.mateu.core.application;

import static io.mateu.core.application.LayoutSyncTest.allMetadata;
import static io.mateu.core.application.LayoutSyncTest.collectMetadata;
import static io.mateu.core.application.LayoutSyncTest.findComponentWithMetadata;
import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.AccordionLayoutDto;
import io.mateu.dtos.AccordionPanelDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.GroupRelationshipDto;
import io.mateu.dtos.TabDto;
import io.mateu.dtos.TabLayoutDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.uidl.annotations.AutoLayout;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.Tab;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UseRadioButtons;
import io.mateu.uidl.data.FieldStereotype;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * In-JVM sync tests for {@code @AutoLayout} inference: fold-optionals (required fields visible,
 * optionals collapsed into a "More options" accordion), sections-to-tabs on heavy read-only views
 * (with the sticky/{@code @Toc}/editable escape hatches), small-enum-as-radio (plus the
 * {@code @UseRadioButtons} override), and the {@code groupRelationship}/{@code adaptable} semantic
 * hints on the tab layout wire DTO — asserted on the DTO tree a real {@code /mateu/v3/sync} request
 * produces, and asserting classes WITHOUT {@code @AutoLayout} keep the previous behaviour.
 */
class LayoutInferenceSyncTest {

  // ------------------------------------------------------------------ fixtures

  public enum Size {
    SMALL,
    MEDIUM,
    LARGE
  }

  public enum Weekday {
    MONDAY,
    TUESDAY,
    WEDNESDAY,
    THURSDAY,
    FRIDAY,
    SATURDAY,
    SUNDAY
  }

  /** Light form: inference enabled but under every threshold — must stay a plain flat form. */
  @SuppressWarnings("unused")
  @UI("/infer/small")
  @AutoLayout
  public static class SmallAutoForm {
    @NotNull String name = "n";

    String nickname = "nick";

    String city = "c";
  }

  /** Heavy unstructured editable form: required stays visible, optionals fold away. */
  @SuppressWarnings("unused")
  @UI("/infer/fold")
  @AutoLayout
  public static class HeavyAutoForm {
    @NotNull String name = "n";

    @NotEmpty String email = "e";

    @NotNull String phone = "p";

    @Stereotype(FieldStereotype.textarea)
    String notes1 = "";

    @Stereotype(FieldStereotype.textarea)
    String notes2 = "";

    @Stereotype(FieldStereotype.textarea)
    String notes3 = "";

    @Stereotype(FieldStereotype.textarea)
    String notes4 = "";

    String extra1 = "";

    String extra2 = "";
  }

  /** Same shape as {@link HeavyAutoForm} but no {@code @AutoLayout}: previous behaviour. */
  @SuppressWarnings("unused")
  @UI("/infer/fold-off")
  public static class HeavyPlainForm {
    @NotNull String name = "n";

    @NotEmpty String email = "e";

    @NotNull String phone = "p";

    @Stereotype(FieldStereotype.textarea)
    String notes1 = "";

    @Stereotype(FieldStereotype.textarea)
    String notes2 = "";

    @Stereotype(FieldStereotype.textarea)
    String notes3 = "";

    @Stereotype(FieldStereotype.textarea)
    String notes4 = "";

    String extra1 = "";

    String extra2 = "";
  }

  @SuppressWarnings("unused")
  @UI("/infer/enums")
  @AutoLayout
  public static class AutoEnumForm {
    Size size = Size.MEDIUM;

    Weekday day = Weekday.MONDAY;
  }

  @SuppressWarnings("unused")
  @UI("/infer/enums-off")
  public static class PlainEnumForm {
    Size size = Size.MEDIUM;

    @UseRadioButtons Weekday day = Weekday.MONDAY;
  }

  /** Heavy read-only view with many substantial sections: presented as adaptable tabs. */
  @SuppressWarnings("unused")
  @UI("/infer/tabs")
  @AutoLayout
  @ReadOnly
  public static class ReadOnlySectionsView {
    @Section("Uno")
    @Stereotype(FieldStereotype.textarea)
    String a1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String a2 = "x";

    @Section("Dos")
    @Stereotype(FieldStereotype.textarea)
    String b1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String b2 = "x";

    @Section("Tres")
    @Stereotype(FieldStereotype.textarea)
    String c1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String c2 = "x";

    @Section("Cuatro")
    @Stereotype(FieldStereotype.textarea)
    String d1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String d2 = "x";

    @Section("Cinco")
    @Stereotype(FieldStereotype.textarea)
    String e1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String e2 = "x";
  }

  /** Same as {@link ReadOnlySectionsView} but editable: hiding groups could hide invalid fields. */
  @SuppressWarnings("unused")
  @UI("/infer/tabs-editable")
  @AutoLayout
  public static class EditableSectionsForm {
    @Section("Uno")
    @Stereotype(FieldStereotype.textarea)
    String a1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String a2 = "x";

    @Section("Dos")
    @Stereotype(FieldStereotype.textarea)
    String b1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String b2 = "x";

    @Section("Tres")
    @Stereotype(FieldStereotype.textarea)
    String c1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String c2 = "x";

    @Section("Cuatro")
    @Stereotype(FieldStereotype.textarea)
    String d1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String d2 = "x";

    @Section("Cinco")
    @Stereotype(FieldStereotype.textarea)
    String e1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String e2 = "x";
  }

  /** A sticky section means the developer chose the pinned scroll layout: no tabs. */
  @SuppressWarnings("unused")
  @UI("/infer/tabs-sticky")
  @AutoLayout
  @ReadOnly
  public static class StickySectionsView {
    @Section(value = "Uno", sticky = true)
    @Stereotype(FieldStereotype.textarea)
    String a1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String a2 = "x";

    @Section("Dos")
    @Stereotype(FieldStereotype.textarea)
    String b1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String b2 = "x";

    @Section("Tres")
    @Stereotype(FieldStereotype.textarea)
    String c1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String c2 = "x";

    @Section("Cuatro")
    @Stereotype(FieldStereotype.textarea)
    String d1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String d2 = "x";

    @Section("Cinco")
    @Stereotype(FieldStereotype.textarea)
    String e1 = "x";

    @Stereotype(FieldStereotype.textarea)
    String e2 = "x";
  }

  /** Developer-declared tabs on an inferring class: respected, and marked adaptable. */
  @SuppressWarnings("unused")
  @UI("/infer/devtabs")
  @AutoLayout
  public static class AutoDevTabsForm {
    @Tab("Uno")
    String first = "1";

    @Tab("Dos")
    String second = "2";
  }

  @SuppressWarnings("unused")
  @UI("/infer/devtabs-off")
  public static class PlainDevTabsForm {
    @Tab("Uno")
    String first = "1";

    @Tab("Dos")
    String second = "2";
  }

  // ------------------------------------------------------------------ harness

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            SmallAutoForm.class,
            HeavyAutoForm.class,
            HeavyPlainForm.class,
            AutoEnumForm.class,
            PlainEnumForm.class,
            ReadOnlySectionsView.class,
            EditableSectionsForm.class,
            StickySectionsView.class,
            AutoDevTabsForm.class,
            PlainDevTabsForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  // ------------------------------------------------------------------ fold optionals

  @Test
  void lightAutoFormStaysFlat() {
    var increment = mateu.sync("/infer/small");
    assertThat(allMetadata(increment, AccordionLayoutDto.class)).isEmpty();
    assertThat(allMetadata(increment, TabLayoutDto.class)).isEmpty();
    assertThat(fieldIds(increment)).contains("name", "nickname", "city");
  }

  @Test
  void heavyAutoFormFoldsOptionalFieldsIntoAMoreOptionsPanel() {
    var increment = mateu.sync("/infer/fold");
    var accordion = findComponentWithMetadata(increment, AccordionLayoutDto.class);
    assertThat(accordion).isNotNull();
    assertThat(accordion.children()).hasSize(1);
    var panel = (ClientSideComponentDto) accordion.children().get(0);
    assertThat(((AccordionPanelDto) panel.metadata()).label()).isEqualTo("More options");
  }

  @Test
  void requiredFieldsStayVisibleAndOptionalFieldsFoldAway() {
    var increment = mateu.sync("/infer/fold");
    var accordion = findComponentWithMetadata(increment, AccordionLayoutDto.class);
    var foldedIds =
        collectMetadata(accordion, FormFieldDto.class).stream().map(FormFieldDto::fieldId).toList();
    assertThat(foldedIds)
        .containsExactlyInAnyOrder("notes1", "notes2", "notes3", "notes4", "extra1", "extra2");
    // every field still reaches the wire exactly once — folding regroups, never drops
    var allIds = fieldIds(increment);
    assertThat(allIds)
        .containsExactlyInAnyOrder(
            "name", "email", "phone", "notes1", "notes2", "notes3", "notes4", "extra1", "extra2");
  }

  @Test
  void withoutAutoLayoutTheHeavyFormKeepsThePreviousFlatBehaviour() {
    var increment = mateu.sync("/infer/fold-off");
    assertThat(allMetadata(increment, AccordionLayoutDto.class)).isEmpty();
    assertThat(fieldIds(increment)).hasSize(9);
  }

  // ------------------------------------------------------------------ enums

  @Test
  void smallEnumRendersAsRadioButtonsUnderAutoLayout() {
    assertThat(field(mateu.sync("/infer/enums"), "size").stereotype()).isEqualTo("radio");
  }

  @Test
  void largeEnumKeepsTheDropdownUnderAutoLayout() {
    assertThat(field(mateu.sync("/infer/enums"), "day").stereotype()).isEqualTo("select");
  }

  @Test
  void withoutAutoLayoutEnumsKeepTheDropdown() {
    assertThat(field(mateu.sync("/infer/enums-off"), "size").stereotype()).isEqualTo("select");
  }

  @Test
  void useRadioButtonsForcesRadioRegardlessOfSizeAndAutoLayout() {
    assertThat(field(mateu.sync("/infer/enums-off"), "day").stereotype()).isEqualTo("radio");
  }

  // ------------------------------------------------------------------ sections → tabs

  @Test
  void heavyReadOnlySectionsBecomeAdaptableTabs() {
    var increment = mateu.sync("/infer/tabs");
    var tabLayout = findComponentWithMetadata(increment, TabLayoutDto.class);
    assertThat(tabLayout).isNotNull();
    var metadata = (TabLayoutDto) tabLayout.metadata();
    assertThat(metadata.adaptable()).isTrue();
    assertThat(metadata.groupRelationship()).isEqualTo(GroupRelationshipDto.alternative);
    var labels =
        tabLayout.children().stream()
            .map(tab -> ((TabDto) ((ClientSideComponentDto) tab).metadata()).label())
            .toList();
    assertThat(labels).containsExactly("Uno", "Dos", "Tres", "Cuatro", "Cinco");
  }

  @Test
  void everySectionFieldSurvivesTheTabsPresentation() {
    var increment = mateu.sync("/infer/tabs");
    assertThat(fieldIds(increment))
        .containsExactlyInAnyOrder("a1", "a2", "b1", "b2", "c1", "c2", "d1", "d2", "e1", "e2");
  }

  @Test
  void editableSectionsStayStackedSoValidationNeverHides() {
    assertThat(allMetadata(mateu.sync("/infer/tabs-editable"), TabLayoutDto.class)).isEmpty();
  }

  @Test
  void aStickySectionDisablesTheTabsInference() {
    assertThat(allMetadata(mateu.sync("/infer/tabs-sticky"), TabLayoutDto.class)).isEmpty();
  }

  // ------------------------------------------------------------------ semantic hints on dev tabs

  @Test
  void developerTabsOnAnInferringClassAreAdaptable() {
    var metadata =
        (TabLayoutDto)
            findComponentWithMetadata(mateu.sync("/infer/devtabs"), TabLayoutDto.class).metadata();
    assertThat(metadata.adaptable()).isTrue();
    assertThat(metadata.groupRelationship()).isEqualTo(GroupRelationshipDto.alternative);
  }

  @Test
  void developerTabsWithoutAutoLayoutCarrySemanticsButAreNotAdaptable() {
    var metadata =
        (TabLayoutDto)
            findComponentWithMetadata(mateu.sync("/infer/devtabs-off"), TabLayoutDto.class)
                .metadata();
    assertThat(metadata.adaptable()).isFalse();
    assertThat(metadata.groupRelationship()).isEqualTo(GroupRelationshipDto.alternative);
  }

  // ------------------------------------------------------------------ helpers

  private static List<String> fieldIds(UIIncrementDto increment) {
    return allMetadata(increment, FormFieldDto.class).stream().map(FormFieldDto::fieldId).toList();
  }

  private static FormFieldDto field(UIIncrementDto increment, String fieldId) {
    return allMetadata(increment, FormFieldDto.class).stream()
        .filter(field -> fieldId.equals(field.fieldId()))
        .findFirst()
        .orElseThrow();
  }
}
