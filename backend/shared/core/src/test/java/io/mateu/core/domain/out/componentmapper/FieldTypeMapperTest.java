package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.Badge;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.annotations.PlainText;
import io.mateu.uidl.annotations.Searchable;
import io.mateu.uidl.annotations.SliderMin;
import io.mateu.uidl.annotations.Stereotype;
import io.mateu.uidl.annotations.UploadableImage;
import io.mateu.uidl.data.Amount;
import io.mateu.uidl.data.FieldStereotype;
import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Stereotype resolution for reflective form fields. The critical scenario is the class-level {@link
 * PlainText} context (read-only, text-only views): every basic-typed field — including booleans,
 * which used to leak through as editable-looking checkboxes — must resolve to the plainText
 * stereotype, while explicit field annotations keep their meaning.
 */
class FieldTypeMapperTest {

  @SuppressWarnings("unused")
  enum Color {
    RED,
    GREEN
  }

  @SuppressWarnings("unused")
  @PlainText
  static class TextOnlyView {
    String name;
    boolean active;
    Boolean certified;
    int count;
    BigDecimal total;
    LocalDate day;
    Color color;
    List<String> tags;

    @Stereotype(FieldStereotype.money)
    BigDecimal price;

    @Badge boolean vip;
  }

  @SuppressWarnings("unused")
  static class EditableForm {
    String name;
    boolean active;
    Color color;
    Amount amount;

    @PlainText String frozen;

    @Stereotype(FieldStereotype.money)
    BigDecimal price;

    @Lookup String supplierId;

    @Searchable String code;

    @SliderMin(0)
    int level;
  }

  private static Field field(Class<?> type, String name) throws Exception {
    return type.getDeclaredField(name);
  }

  // ── class-level @PlainText context ────────────────────────────────────────

  @Test
  void booleanInPlainTextClassIsPlainText() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(TextOnlyView.class, "active")))
        .isEqualTo(FieldStereotype.plainText);
  }

  @Test
  void boxedBooleanInPlainTextClassIsPlainText() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(TextOnlyView.class, "certified")))
        .isEqualTo(FieldStereotype.plainText);
  }

  @Test
  void basicTypesInPlainTextClassArePlainText() throws Exception {
    for (String name : new String[] {"name", "count", "total", "day", "color"}) {
      assertThat(FieldTypeMapper.getStereotype(field(TextOnlyView.class, name)))
          .as("field %s", name)
          .isEqualTo(FieldStereotype.plainText);
    }
  }

  @Test
  void nonBasicTypeInPlainTextClassIsNotPlainText() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(TextOnlyView.class, "tags")))
        .isEqualTo(FieldStereotype.regular);
  }

  @Test
  void moneyStereotypeInPlainTextClassKeepsPlainTextLayout() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(TextOnlyView.class, "price")))
        .isEqualTo(FieldStereotype.plainText);
  }

  @Test
  void explicitBadgeWinsOverPlainTextContext() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(TextOnlyView.class, "vip")))
        .isEqualTo(FieldStereotype.badge);
  }

  // ── editable (non-PlainText) context ──────────────────────────────────────

  @Test
  void booleanInEditableFormStaysRegular() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "active")))
        .isEqualTo(FieldStereotype.regular);
  }

  @Test
  void enumInEditableFormIsSelect() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "color")))
        .isEqualTo(FieldStereotype.select);
  }

  @Test
  void fieldLevelPlainTextIsPlainText() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "frozen")))
        .isEqualTo(FieldStereotype.plainText);
  }

  @Test
  void moneyStereotypeInEditableFormStaysMoney() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "price")))
        .isEqualTo(FieldStereotype.money);
  }

  @Test
  void amountTypeIsMoney() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "amount")))
        .isEqualTo(FieldStereotype.money);
  }

  @Test
  void lookupIsCombobox() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "supplierId")))
        .isEqualTo(FieldStereotype.combobox);
  }

  @Test
  void searchableIsSearchable() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "code")))
        .isEqualTo(FieldStereotype.searchable);
  }

  @Test
  void sliderBoundsMakeSlider() throws Exception {
    assertThat(FieldTypeMapper.getStereotype(field(EditableForm.class, "level")))
        .isEqualTo(FieldStereotype.slider);
  }

  @Test
  void uploadableImageAnnotationWins() throws Exception {
    @SuppressWarnings("unused")
    class WithImage {
      @UploadableImage String photo;
    }
    assertThat(FieldTypeMapper.getStereotype(field(WithImage.class, "photo")))
        .isEqualTo(FieldStereotype.uploadableImage);
  }
}
