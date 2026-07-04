package io.mateu.core.domain.out.componentmapper;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.FakeHttpRequest;
import io.mateu.dtos.RunActionRqDto;
import io.mateu.uidl.annotations.Colspan;
import io.mateu.uidl.annotations.Label;
import io.mateu.uidl.annotations.Lookup;
import io.mateu.uidl.data.Option;
import io.mateu.uidl.interfaces.ColspanSupplier;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.LabelSupplier;
import io.mateu.uidl.interfaces.RequiredSupplier;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
import java.lang.reflect.Field;
import java.util.List;
import org.junit.jupiter.api.Test;

/**
 * Static extraction helpers behind every reflective form field: label resolution (annotation →
 * humanized name → supplier precedence), field ids for read-only lookups, colspan, required and
 * min/max detection, and enum options. All annotation reads are meta-aware, so composed (semantic)
 * annotations must behave like the direct ones.
 */
class FieldMetadataExtractorTest {

  @Retention(RetentionPolicy.RUNTIME)
  @Target(ElementType.FIELD)
  @Label("Total amount")
  @interface ImporteTotal {}

  enum Color {
    @Label("Rojo")
    RED,
    GREEN
  }

  @SuppressWarnings("unused")
  static class Form {
    String plainField;

    @Label("Nombre completo")
    String labelled;

    @ImporteTotal Double composedLabel;

    @Lookup String supplierId;

    @Colspan(3)
    String wide;

    @NotNull String mandatory;

    @NotEmpty String nonEmpty;

    String optional;

    @Min(2)
    @Max(10)
    int bounded;

    Color color;
  }

  static class WithSuppliers implements LabelSupplier, ColspanSupplier, RequiredSupplier {
    @Override
    public String label(String memberName, HttpRequest httpRequest) {
      return "plainField".equals(memberName) ? "From supplier" : "";
    }

    @Override
    public int colspan(String memberName, HttpRequest httpRequest) {
      return "plainField".equals(memberName) ? 2 : 0;
    }

    @Override
    public boolean isRequired(String memberName, HttpRequest httpRequest) {
      return "optional".equals(memberName);
    }
  }

  private static Field field(String name) {
    try {
      return Form.class.getDeclaredField(name);
    } catch (NoSuchFieldException e) {
      throw new IllegalStateException(e);
    }
  }

  private static FakeHttpRequest httpRequest() {
    return new FakeHttpRequest(RunActionRqDto.builder().build());
  }

  @Test
  void labelComesFromTheAnnotationOrTheHumanizedFieldName() {
    assertThat(FieldMetadataExtractor.getLabel(field("labelled"))).isEqualTo("Nombre completo");
    assertThat(FieldMetadataExtractor.getLabel(field("plainField"))).isEqualTo("Plain field");
  }

  @Test
  void composedLabelAnnotationWorksLikeTheDirectOne() {
    assertThat(FieldMetadataExtractor.getLabel(field("composedLabel"))).isEqualTo("Total amount");
  }

  @Test
  void labelSupplierTakesPrecedenceButEmptyValuesFallBack() {
    WithSuppliers instance = new WithSuppliers();
    assertThat(FieldMetadataExtractor.getLabel(field("plainField"), instance, httpRequest()))
        .isEqualTo("From supplier");
    // supplier returns "" for this field → falls back to the annotation/name
    assertThat(FieldMetadataExtractor.getLabel(field("labelled"), instance, httpRequest()))
        .isEqualTo("Nombre completo");
  }

  @Test
  void readOnlyLookupFieldsGetTheLabelSuffixOnTheirId() {
    assertThat(FieldMetadataExtractor.getFieldId(field("supplierId"), "pre-", true))
        .isEqualTo("pre-supplierId-label");
    assertThat(FieldMetadataExtractor.getFieldId(field("supplierId"), "pre-", false))
        .isEqualTo("pre-supplierId");
    assertThat(FieldMetadataExtractor.getFieldId(field("plainField"), "", true))
        .isEqualTo("plainField");
  }

  @Test
  void colspanComesFromTheAnnotationWithSupplierPrecedence() {
    assertThat(FieldMetadataExtractor.getColspan(field("wide"))).isEqualTo(3);
    assertThat(FieldMetadataExtractor.getColspan(field("plainField"))).isEqualTo(1);

    WithSuppliers instance = new WithSuppliers();
    assertThat(FieldMetadataExtractor.getColspan(field("plainField"), instance, httpRequest()))
        .isEqualTo(2);
    // supplier returns 0 for this field → falls back to the annotation
    assertThat(FieldMetadataExtractor.getColspan(field("wide"), instance, httpRequest()))
        .isEqualTo(3);
  }

  @Test
  void requiredComesFromValidationAnnotationsOrTheSupplier() {
    assertThat(FieldMetadataExtractor.isRequired(field("mandatory"), new Object(), httpRequest()))
        .isTrue();
    assertThat(FieldMetadataExtractor.isRequired(field("nonEmpty"), new Object(), httpRequest()))
        .isTrue();
    assertThat(FieldMetadataExtractor.isRequired(field("optional"), new Object(), httpRequest()))
        .isFalse();
    assertThat(
            FieldMetadataExtractor.isRequired(
                field("optional"), new WithSuppliers(), httpRequest()))
        .isTrue();
  }

  @Test
  void minAndMaxComeFromBeanValidationAnnotations() {
    assertThat(FieldMetadataExtractor.getMin(field("bounded"))).isEqualTo(2.0);
    assertThat(FieldMetadataExtractor.getMax(field("bounded"))).isEqualTo(10.0);
    assertThat(FieldMetadataExtractor.getMin(field("plainField"))).isNull();
    assertThat(FieldMetadataExtractor.getMax(field("plainField"))).isNull();
  }

  @Test
  void enumFieldsProduceOptionsHonouringPerConstantLabels() {
    List<Option> options =
        FieldMetadataExtractor.getOptions(field("color"), new Object(), httpRequest());

    assertThat(options).extracting(Option::value).containsExactly("RED", "GREEN");
    assertThat(options).extracting(Option::label).containsExactly("Rojo", "GREEN");
  }
}
