package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.BadgeDto;
import io.mateu.dtos.CardDto;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.ComponentDto;
import io.mateu.dtos.ComponentMetadataDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.PageDto;
import io.mateu.dtos.ServerSideComponentDto;
import io.mateu.dtos.UIIncrementDto;
import io.mateu.dtos.ValidationDto;
import io.mateu.uidl.annotations.Badge;
import io.mateu.uidl.annotations.BadgeInHeader;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Help;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.LinkTo;
import io.mateu.uidl.annotations.Multiline;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Section;
import io.mateu.uidl.annotations.SliderMax;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.annotations.UploadableImage;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.NavLink;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LinkSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * Integration coverage of the reflective field-mapping pipeline: every supported field kind and
 * field-level annotation, synced through the full in-JVM sync flow and asserted on the produced
 * {@link FormFieldDto} wire records.
 */
class FieldKindsSyncTest {

  // ---------------------------------------------------------------------------------------------
  // Fixtures
  // ---------------------------------------------------------------------------------------------

  public enum Colour {
    RED,
    @Label("Verde")
    GREEN,
    BLUE
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/basic")
  public static class BasicTypesForm {
    String name = "Ada";
    int count = 3;
    Integer boxedCount = 7;
    long total = 42L;
    double ratio = 0.5;
    BigDecimal price = new BigDecimal("12.34");
    boolean active = true;
    Boolean boxedActive = Boolean.FALSE;
    LocalDate day = LocalDate.of(2026, 7, 5);
    LocalDateTime moment = LocalDateTime.of(2026, 7, 5, 10, 30);
    LocalTime alarm = LocalTime.of(8, 15);
    Colour colour = Colour.GREEN;
    List<String> tags = new ArrayList<>(List.of("a", "b"));
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/annotated")
  public static class AnnotatedForm {
    @Label("Nombre completo")
    String fullName = "Ada Lovelace";

    @Help("Introduce tu correo")
    String email;

    @Colspan(3)
    String address;

    @ReadOnly String code = "X-1";

    @NotNull String requiredName;

    @NotEmpty String requiredList;

    @Min(18)
    @Max(99)
    int age = 21;

    @Stereotype(FieldStereotype.textarea)
    String notes;

    @SliderMin(10)
    @SliderMax(50)
    int volume = 20;

    @Stereotype(FieldStereotype.money)
    BigDecimal balance = new BigDecimal("1000.50");

    Amount fee = new Amount("EUR", 12.5);

    @Badge boolean vip = true;

    @UploadableImage String photo;

    @Label("${state.fullName} — details")
    String details;
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/plain")
  @PlainText
  public static class PlainTextForm {
    String name = "Grace";
    boolean active = true;
    int visits = 9;
    LocalDate birth = LocalDate.of(1906, 12, 9);

    @Multiline String bio = "line1\nline2";

    @Stereotype(FieldStereotype.money)
    BigDecimal saldo = new BigDecimal("250.75");
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/sections")
  public static class SectionedForm {
    @Section("Datos personales")
    String name = "Ada";

    LocalDate birth = LocalDate.of(1815, 12, 10);

    @Section("Estado")
    boolean active = true;
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/badges")
  public static class BadgeHeaderForm {
    @BadgeInHeader(label = "VIP", color = "success")
    boolean vip = true;

    @BadgeInHeader String status = "Confirmed";

    String name = "Ada";
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/links")
  public static class LinkedForm {
    String customerId = "42";

    @LinkTo("/customers/${state.customerId}")
    String customerName = "Ada";

    @LinkTo(
        value = "https://mateu.io",
        icon = "vaadin:external-link",
        title = "Abrir ${state.customerName}",
        target = "_blank")
    String website;

    String plain;
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/supplied-links")
  public static class SuppliedLinkForm implements LinkSupplier {
    @LinkTo("/annotated/${state.customerId}")
    String customerId = "42";

    String orderId = "A-1";

    @Override
    public NavLink link(String memberName, HttpRequest httpRequest) {
      if ("orderId".equals(memberName)) {
        return NavLink.builder().href("/orders/${state.orderId}").icon("vaadin:cart").build();
      }
      return null;
    }
  }

  @SuppressWarnings("unused")
  public static class Row {
    String concept = "thing";
    int qty = 1;
    boolean done = false;
  }

  @SuppressWarnings("unused")
  @UI("/field-kinds/grid")
  public static class GridForm {
    @OnRowSelected("rowPicked")
    List<Row> rows = new ArrayList<>(List.of(new Row()));

    void rowPicked(Row row) {}
  }

  // ---------------------------------------------------------------------------------------------
  // Harness
  // ---------------------------------------------------------------------------------------------

  static TestMateu mateu;
  static final Map<String, UIIncrementDto> incrementCache = new HashMap<>();

  @BeforeAll
  static void boot() {
    mateu =
        TestMateu.withUis(
            BasicTypesForm.class,
            AnnotatedForm.class,
            PlainTextForm.class,
            SectionedForm.class,
            BadgeHeaderForm.class,
            GridForm.class,
            LinkedForm.class,
            SuppliedLinkForm.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static ServerSideComponentDto root(String route) {
    var increment = incrementCache.computeIfAbsent(route, r -> mateu.sync(r));
    return (ServerSideComponentDto) increment.fragments().get(0).component();
  }

  /** All FormFieldDto records in the tree, keyed by fieldId, in render order. */
  static Map<String, FormFieldDto> fieldsOf(String route) {
    var result = new LinkedHashMap<String, FormFieldDto>();
    collect(root(route), FormFieldDto.class).forEach(f -> result.put(f.fieldId(), f));
    return result;
  }

  /** Depth-first collection of every metadata DTO of the given type in the component tree. */
  static <T> List<T> collect(Object component, Class<T> type) {
    var found = new ArrayList<T>();
    walk(component, type, found);
    return found;
  }

  static <T> void walk(Object node, Class<T> type, List<T> found) {
    if (node == null) {
      return;
    }
    if (node instanceof ClientSideComponentDto client) {
      if (client.metadata() != null) {
        if (type.isInstance(client.metadata())) {
          found.add(type.cast(client.metadata()));
        }
        walkMetadata(client.metadata(), type, found);
      }
      client.children().forEach(child -> walk(child, type, found));
    } else if (node instanceof ServerSideComponentDto server) {
      server.children().forEach(child -> walk(child, type, found));
    }
  }

  /** Metadata records (CardDto, FormFieldDto, PageDto, ...) nest components in their own fields. */
  static <T> void walkMetadata(ComponentMetadataDto metadata, Class<T> type, List<T> found) {
    if (!metadata.getClass().isRecord()) {
      return;
    }
    for (var recordComponent : metadata.getClass().getRecordComponents()) {
      Object value;
      try {
        value = recordComponent.getAccessor().invoke(metadata);
      } catch (ReflectiveOperationException e) {
        throw new AssertionError("cannot read " + recordComponent, e);
      }
      if (value instanceof ComponentDto dto) {
        walk(dto, type, found);
      } else if (value instanceof List<?> list) {
        list.forEach(
            item -> {
              if (item instanceof ComponentDto dto) {
                walk(dto, type, found);
              }
            });
      }
    }
  }

  // ---------------------------------------------------------------------------------------------
  // Basic data types
  // ---------------------------------------------------------------------------------------------

  @Test
  void stringFieldMapsToStringRegular() {
    var field = fieldsOf("/field-kinds/basic").get("name");
    assertThat(field).isNotNull();
    assertThat(field.dataType()).isEqualTo("string");
    assertThat(field.stereotype()).isEqualTo("regular");
    assertThat(field.label()).isEqualTo("Name");
    assertThat(field.colspan()).isEqualTo(1);
    assertThat(field.required()).isFalse();
    assertThat(field.readOnly()).isFalse();
  }

  @Test
  void intFieldMapsToIntegerWithStepButtons() {
    var field = fieldsOf("/field-kinds/basic").get("count");
    assertThat(field.dataType()).isEqualTo("integer");
    assertThat(field.stepButtonsVisible()).isTrue();
  }

  @Test
  void boxedIntegerAndLongMapToInteger() {
    var fields = fieldsOf("/field-kinds/basic");
    assertThat(fields.get("boxedCount").dataType()).isEqualTo("integer");
    assertThat(fields.get("total").dataType()).isEqualTo("integer");
  }

  @Test
  void doubleAndBigDecimalMapToNumberWithoutStepButtons() {
    var fields = fieldsOf("/field-kinds/basic");
    assertThat(fields.get("ratio").dataType()).isEqualTo("number");
    assertThat(fields.get("ratio").stepButtonsVisible()).isFalse();
    assertThat(fields.get("price").dataType()).isEqualTo("number");
  }

  @Test
  void booleanFieldsMapToBool() {
    var fields = fieldsOf("/field-kinds/basic");
    assertThat(fields.get("active").dataType()).isEqualTo("bool");
    assertThat(fields.get("boxedActive").dataType()).isEqualTo("bool");
  }

  @Test
  void temporalFieldsMapToDateDateTimeAndTime() {
    var fields = fieldsOf("/field-kinds/basic");
    assertThat(fields.get("day").dataType()).isEqualTo("date");
    assertThat(fields.get("moment").dataType()).isEqualTo("dateTime");
    assertThat(fields.get("alarm").dataType()).isEqualTo("time");
  }

  @Test
  void enumFieldMapsToSelectWithOneOptionPerConstant() {
    var field = fieldsOf("/field-kinds/basic").get("colour");
    assertThat(field.dataType()).isEqualTo("string");
    assertThat(field.stereotype()).isEqualTo("select");
    assertThat(field.options())
        .extracting(o -> o.value(), o -> o.label())
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("RED", "RED"),
            org.assertj.core.groups.Tuple.tuple("GREEN", "Verde"),
            org.assertj.core.groups.Tuple.tuple("BLUE", "BLUE"));
  }

  @Test
  void listOfStringsMapsToArray() {
    var field = fieldsOf("/field-kinds/basic").get("tags");
    assertThat(field).isNotNull();
    assertThat(field.dataType()).isEqualTo("array");
  }

  @Test
  void initialValuesTravelInTheFragmentState() {
    var increment = incrementCache.computeIfAbsent("/field-kinds/basic", r -> mateu.sync(r));
    @SuppressWarnings("unchecked")
    var state = (Map<String, Object>) increment.fragments().get(0).state();
    assertThat(state)
        .containsEntry("name", "Ada")
        .containsEntry("count", 3)
        .containsEntry("active", true);
  }

  // ---------------------------------------------------------------------------------------------
  // Field-level annotations
  // ---------------------------------------------------------------------------------------------

  @Test
  void labelAnnotationOverridesTheHumanizedFieldName() {
    var field = fieldsOf("/field-kinds/annotated").get("fullName");
    assertThat(field.label()).isEqualTo("Nombre completo");
  }

  @Test
  void helpAnnotationBecomesTheFieldDescription() {
    var field = fieldsOf("/field-kinds/annotated").get("email");
    assertThat(field.description()).isEqualTo("Introduce tu correo");
  }

  @Test
  void colspanAnnotationTravelsToTheDto() {
    var field = fieldsOf("/field-kinds/annotated").get("address");
    assertThat(field.colspan()).isEqualTo(3);
  }

  @Test
  void readOnlyAnnotationMakesTheFieldReadOnly() {
    var field = fieldsOf("/field-kinds/annotated").get("code");
    assertThat(field.readOnly()).isTrue();
  }

  @Test
  void notNullAndNotEmptyMakeTheFieldRequired() {
    var fields = fieldsOf("/field-kinds/annotated");
    assertThat(fields.get("requiredName").required()).isTrue();
    assertThat(fields.get("requiredList").required()).isTrue();
    assertThat(fields.get("fullName").required()).isFalse();
  }

  @Test
  void notNullEmitsAValidationOnTheComponent() {
    var validations = root("/field-kinds/annotated").validations();
    assertThat(validations)
        .filteredOn(v -> "requiredName".equals(v.fieldId()))
        .extracting(ValidationDto::condition, ValidationDto::message)
        .containsExactly(
            org.assertj.core.groups.Tuple.tuple("state['requiredName']", "Cannot be empty"));
  }

  @Test
  void minAndMaxEmitRangeValidations() {
    var validations = root("/field-kinds/annotated").validations();
    assertThat(validations)
        .filteredOn(v -> "age".equals(v.fieldId()))
        .extracting(ValidationDto::condition, ValidationDto::message)
        .containsExactlyInAnyOrder(
            org.assertj.core.groups.Tuple.tuple("state['age'] >= 18", "Must be at least 18"),
            org.assertj.core.groups.Tuple.tuple("state['age'] <= 99", "Must be at most 99"));
  }

  @Test
  void textareaStereotypeTravels() {
    var field = fieldsOf("/field-kinds/annotated").get("notes");
    assertThat(field.stereotype()).isEqualTo("textarea");
    assertThat(field.dataType()).isEqualTo("string");
  }

  @Test
  void sliderAnnotationsProduceASliderWithBounds() {
    var field = fieldsOf("/field-kinds/annotated").get("volume");
    assertThat(field.stereotype()).isEqualTo("slider");
    assertThat(field.sliderMin()).isEqualTo(10);
    assertThat(field.sliderMax()).isEqualTo(50);
  }

  @Test
  void moneyStereotypeOnANumericFieldKeepsNumberDataType() {
    var field = fieldsOf("/field-kinds/annotated").get("balance");
    assertThat(field.stereotype()).isEqualTo("money");
    assertThat(field.dataType()).isEqualTo("number");
  }

  @Test
  void amountTypedFieldMapsToMoney() {
    var field = fieldsOf("/field-kinds/annotated").get("fee");
    assertThat(field.dataType()).isEqualTo("money");
    assertThat(field.stereotype()).isEqualTo("money");
  }

  @Test
  void badgeAnnotationRendersABooleanAsBadgeStereotype() {
    var field = fieldsOf("/field-kinds/annotated").get("vip");
    assertThat(field.dataType()).isEqualTo("bool");
    assertThat(field.stereotype()).isEqualTo("badge");
  }

  @Test
  void uploadableImageAnnotationSetsTheStereotype() {
    var field = fieldsOf("/field-kinds/annotated").get("photo");
    assertThat(field.stereotype()).isEqualTo("uploadableImage");
  }

  @Test
  void labelExpressionInterpolationTravelsVerbatimForTheFrontend() {
    var field = fieldsOf("/field-kinds/annotated").get("details");
    assertThat(field.label()).isEqualTo("${state.fullName} — details");
  }

  // ---------------------------------------------------------------------------------------------
  // @LinkTo + LinkSupplier
  // ---------------------------------------------------------------------------------------------

  @Test
  void linkToAnnotationTravelsVerbatimForClientSideInterpolation() {
    var field = fieldsOf("/field-kinds/links").get("customerName");
    assertThat(field.link()).isNotNull();
    assertThat(field.link().href()).isEqualTo("/customers/${state.customerId}");
    assertThat(field.link().icon()).isEmpty();
    assertThat(field.link().title()).isEmpty();
    assertThat(field.link().target()).isEmpty();
  }

  @Test
  void linkToAnnotationCarriesIconTitleAndTarget() {
    var link = fieldsOf("/field-kinds/links").get("website").link();
    assertThat(link.href()).isEqualTo("https://mateu.io");
    assertThat(link.icon()).isEqualTo("vaadin:external-link");
    assertThat(link.title()).isEqualTo("Abrir ${state.customerName}");
    assertThat(link.target()).isEqualTo("_blank");
  }

  @Test
  void fieldsWithoutLinkToHaveNoLink() {
    assertThat(fieldsOf("/field-kinds/links").get("plain").link()).isNull();
    assertThat(fieldsOf("/field-kinds/links").get("customerId").link()).isNull();
  }

  @Test
  void linkSupplierAttachesLinksProgrammatically() {
    var link = fieldsOf("/field-kinds/supplied-links").get("orderId").link();
    assertThat(link).isNotNull();
    assertThat(link.href()).isEqualTo("/orders/${state.orderId}");
    assertThat(link.icon()).isEqualTo("vaadin:cart");
  }

  @Test
  void linkSupplierReturningNullFallsBackToTheAnnotation() {
    var link = fieldsOf("/field-kinds/supplied-links").get("customerId").link();
    assertThat(link).isNotNull();
    assertThat(link.href()).isEqualTo("/annotated/${state.customerId}");
  }

  // ---------------------------------------------------------------------------------------------
  // Class-level @PlainText (+ @Multiline, money-in-plaintext)
  // ---------------------------------------------------------------------------------------------

  @Test
  void classLevelPlainTextMakesAllBasicFieldsPlainText() {
    var fields = fieldsOf("/field-kinds/plain");
    assertThat(fields.get("name").stereotype()).isEqualTo("plainText");
    assertThat(fields.get("active").stereotype()).isEqualTo("plainText");
    assertThat(fields.get("active").dataType()).isEqualTo("bool");
    assertThat(fields.get("visits").stereotype()).isEqualTo("plainText");
    assertThat(fields.get("birth").stereotype()).isEqualTo("plainText");
  }

  @Test
  void multilineAnnotationSetsTheMultilineFlag() {
    var fields = fieldsOf("/field-kinds/plain");
    assertThat(fields.get("bio").multiline()).isTrue();
  }

  @Test
  void moneyStereotypeInAPlainTextClassKeepsPlainTextButTagsMoneyDataType() {
    var field = fieldsOf("/field-kinds/plain").get("saldo");
    assertThat(field.stereotype()).isEqualTo("plainText");
    assertThat(field.dataType()).isEqualTo("money");
  }

  // ---------------------------------------------------------------------------------------------
  // @Section grouping
  // ---------------------------------------------------------------------------------------------

  @Test
  void sectionsGroupFieldsIntoCards() {
    var cards = collect(root("/field-kinds/sections"), CardDto.class);
    assertThat(cards).hasSizeGreaterThanOrEqualTo(2);
    // fields inside section cards are still reachable in the tree
    var fields = fieldsOf("/field-kinds/sections");
    assertThat(fields).containsKeys("name", "birth", "active");
  }

  // ---------------------------------------------------------------------------------------------
  // @BadgeInHeader (page-level badges)
  // ---------------------------------------------------------------------------------------------

  @Test
  void badgeInHeaderFieldsBecomeReactivePageBadges() {
    var pages = collect(root("/field-kinds/badges"), PageDto.class);
    assertThat(pages).isNotEmpty();
    var badges = pages.get(0).badges();
    assertThat(badges)
        .extracting(BadgeDto::text, BadgeDto::color)
        .containsExactlyInAnyOrder(
            org.assertj.core.groups.Tuple.tuple("${state.vip ? 'VIP' : ''}", "success"),
            org.assertj.core.groups.Tuple.tuple("${state.status}", "normal"));
  }

  @Test
  void badgeInHeaderFieldsAreExcludedFromTheFormBody() {
    var fields = fieldsOf("/field-kinds/badges");
    assertThat(fields).containsKey("name");
    assertThat(fields).doesNotContainKeys("vip", "status");
  }

  // ---------------------------------------------------------------------------------------------
  // List of nested rows (grid stereotype, @OnRowSelected)
  // ---------------------------------------------------------------------------------------------

  @Test
  void listOfNestedRowsBecomesAGrid() {
    var field = fieldsOf("/field-kinds/grid").get("rows");
    assertThat(field).isNotNull();
    assertThat(field.dataType()).isEqualTo("array");
    assertThat(field.stereotype()).isEqualTo("grid");
    assertThat(field.itemIdPath()).isEqualTo("_rowNumber");
  }

  @Test
  void gridColumnsMirrorTheRowFieldsPlusTheEditButton() {
    var field = fieldsOf("/field-kinds/grid").get("rows");
    var columns = new ArrayList<GridColumnDto>();
    field.columns().forEach(column -> walk(column, GridColumnDto.class, columns));
    assertThat(columns)
        .extracting(GridColumnDto::id)
        .containsExactly("concept", "qty", "done", "_select");
    // Columns only distinguish bool/status/action/component; numeric columns travel as string
    // (ColumnTypeMapper.getDataTypeForColumn), unlike form fields.
    assertThat(columns)
        .filteredOn(c -> "qty".equals(c.id()))
        .extracting(GridColumnDto::dataType)
        .containsExactly("string");
    assertThat(columns)
        .filteredOn(c -> "done".equals(c.id()))
        .extracting(GridColumnDto::dataType)
        .containsExactly("bool");
    assertThat(columns)
        .filteredOn(c -> "_select".equals(c.id()))
        .extracting(GridColumnDto::stereotype, GridColumnDto::actionId)
        .containsExactly(org.assertj.core.groups.Tuple.tuple("button", "rows_select"));
  }

  @Test
  void onRowSelectedBindsTheSelectionActionId() {
    var field = fieldsOf("/field-kinds/grid").get("rows");
    assertThat(field.onItemSelectionActionId()).isEqualTo("rowPicked");
  }
}
