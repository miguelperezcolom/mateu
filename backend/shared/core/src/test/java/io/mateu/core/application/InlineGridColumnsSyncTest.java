package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.ClientSideComponentDto;
import io.mateu.dtos.FormFieldDto;
import io.mateu.dtos.GridColumnDto;
import io.mateu.dtos.OptionDto;
import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.DetailFormCustomisation;
import io.mateu.uidl.annotations.Hidden;
import io.mateu.uidl.annotations.HiddenInList;
import io.mateu.uidl.annotations.Inline;
import io.mateu.uidl.annotations.InlineEditing;
import io.mateu.uidl.annotations.OnRowSelected;
import io.mateu.uidl.annotations.ReadOnly;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.OptionsSupplier;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * A grid field's columns: with {@code @InlineEditing} every data column gets the cell editor its
 * Java type implies (dates, times, money, numbers, enums, host-supplied choices) unless the field
 * is {@code @ReadOnly}; {@code @Hidden}/{@code @HiddenInList} columns are left out; widths follow
 * {@code @ColumnWidth}; and a grid inside an inline section routes its row selection through the
 * nested-form action of that section.
 */
class InlineGridColumnsSyncTest {

  public enum Shift {
    MORNING,
    NIGHT
  }

  public static class Line {
    public LocalDate day;
    public LocalDateTime at;
    public LocalTime opens;

    @Stereotype(FieldStereotype.money)
    public BigDecimal price;

    public double weight;
    public Shift shift;
    public String room;

    @ReadOnly
    @ColumnWidth("9rem")
    public String code;

    @ColumnWidth("auto")
    public String notes;

    @Hidden public String secret;
    @HiddenInList public String internal;
  }

  public static class Guest {
    public String name;
  }

  public static class GuestsSection {
    @OnRowSelected(value = "onGuestSelected", shortcut = "ctrl+shift")
    public List<Guest> guests = new ArrayList<>();

    public void onGuestSelected(Guest guest) {}
  }

  @UI("/inline-grid-columns")
  public static class Booking implements OptionsSupplier {
    @InlineEditing public List<Line> lines = new ArrayList<>();

    @DetailFormCustomisation(columns = 3)
    public List<Guest> companions = new ArrayList<>();

    @Inline public GuestsSection party = new GuestsSection();

    @Override
    public boolean supports(Class<?> fieldType, String fieldName, Class<?> formType) {
      return "room".equals(fieldName);
    }

    @Override
    public List<Option> options(String fieldName, HttpRequest httpRequest) {
      return List.of(new Option("101", "Room 101"), new Option("102", "Room 102"));
    }
  }

  static TestMateu mateu;
  static Map<String, FormFieldDto> fields;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Booking.class);
    var root = mateu.sync("/inline-grid-columns").fragments().get(0).component();
    fields = new LinkedHashMap<>();
    FieldKindsSyncTest.collect(root, FormFieldDto.class).forEach(f -> fields.put(f.fieldId(), f));
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  private static Map<String, GridColumnDto> columns(String fieldId) {
    var field = fields.get(fieldId);
    assertThat(field).as(fieldId + " in " + fields.keySet()).isNotNull();
    var out = new LinkedHashMap<String, GridColumnDto>();
    for (var c : field.columns()) {
      if (c instanceof ClientSideComponentDto client
          && client.metadata() instanceof GridColumnDto column) {
        out.put(column.id(), column);
      }
    }
    return out;
  }

  @Test
  void everyInlineColumnGetsTheEditorItsTypeImplies() {
    var lines = columns("lines");
    assertThat(fields.get("lines").inlineEditing()).isTrue();
    assertThat(lines.get("day").editorType()).isEqualTo("date");
    assertThat(lines.get("at").editorType()).isEqualTo("datetime");
    assertThat(lines.get("opens").editorType()).isEqualTo("time");
    assertThat(lines.get("price").editorType()).isEqualTo("number");
    assertThat(lines.get("weight").editorType()).isEqualTo("number");
    assertThat(lines.get("shift").editorType()).isEqualTo("select");
    assertThat(lines.get("shift").editorOptions())
        .extracting(OptionDto::value)
        .containsExactly("MORNING", "NIGHT");
    assertThat(lines.get("notes").editorType()).isEqualTo("text");
  }

  @Test
  void aHostSuppliedChoiceListTurnsATextColumnIntoASelect() {
    var room = columns("lines").get("room");
    assertThat(room.editorType()).isEqualTo("select");
    assertThat(room.editorOptions()).extracting(OptionDto::value).containsExactly("101", "102");
  }

  @Test
  void readOnlyHiddenAndWidthRulesApplyToColumns() {
    var lines = columns("lines");
    assertThat(lines).doesNotContainKeys("secret", "internal", "_select");
    var code = lines.get("code");
    assertThat(code.editable()).isFalse();
    assertThat(code.editorType()).isNull();
    assertThat(code.width()).isEqualTo("9rem");
    assertThat(code.flexGrow()).isEqualTo("0");
    var notes = lines.get("notes");
    assertThat(notes.autoWidth()).isTrue();
    assertThat(notes.width()).isNull();
    assertThat(notes.flexGrow()).isEqualTo("0");
    assertThat(lines.get("day").flexGrow()).isNull();
  }

  @Test
  void aDetailFormGridKeepsItsEditButtonAndDeclaredColumns() {
    var companions = fields.get("companions");
    assertThat(companions.formColumns()).isEqualTo(3);
    assertThat(columns("companions")).containsKey("_select");
  }

  @Test
  void aGridInAnInlineSectionRoutesRowSelectionThroughTheSection() {
    var guests =
        fields.values().stream()
            .filter(f -> f.fieldId().endsWith("guests"))
            .findFirst()
            .orElseThrow(() -> new AssertionError("no guests grid in " + fields.keySet()));
    assertThat(guests.onItemSelectionActionId())
        .isEqualTo("nested-form-action-party-onGuestSelected");
    assertThat(guests.rowSelectionShortcut()).isEqualTo("ctrl+shift");
  }
}
