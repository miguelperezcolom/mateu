package io.mateu.core.application;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.core.testutil.TestMateu;
import io.mateu.dtos.FormFieldDto;
import io.mateu.uidl.annotations.Representation;
import io.mateu.uidl.annotations.UI;
import io.mateu.uidl.data.FieldStereotype;
import io.mateu.uidl.data.Range;
import io.mateu.uidl.interfaces.HttpRequest;
import io.mateu.uidl.interfaces.StereotypeSupplier;
import java.util.LinkedHashMap;
import java.util.Map;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

/**
 * The data type and stereotype a form field gets: boxed longs and floats keep their numeric kind, a
 * {@code Range} is edited as its two bounds, and the stereotype comes from {@code @Representation}
 * or, per request, from the view's {@link StereotypeSupplier} (which may decline).
 */
class FieldDataTypesSyncTest {

  @UI("/field-data-types")
  public static class Form implements StereotypeSupplier {
    public Long visits = 3L;
    public float ratio = 0.5f;
    public Float weight = 1.5f;
    public Range nights = new Range(1, 7);

    @Representation(FieldStereotype.textarea)
    public String notes;

    public String supplied;
    public String unsupplied;

    @Override
    public FieldStereotype stereotype(String memberName, HttpRequest httpRequest) {
      return "supplied".equals(memberName) ? FieldStereotype.richText : null;
    }
  }

  static TestMateu mateu;

  @BeforeAll
  static void boot() {
    mateu = TestMateu.withUis(Form.class);
  }

  @AfterAll
  static void shutdown() {
    mateu.close();
  }

  static Map<String, FormFieldDto> fields() {
    var root = mateu.sync("/field-data-types").fragments().get(0).component();
    var out = new LinkedHashMap<String, FormFieldDto>();
    FieldKindsSyncTest.collect(root, FormFieldDto.class).forEach(f -> out.put(f.fieldId(), f));
    return out;
  }

  @Test
  void boxedLongsAndFloatsKeepTheirNumericKind() {
    var fields = fields();
    assertThat(fields.get("visits").dataType()).isEqualTo("integer");
    assertThat(fields.get("ratio").dataType()).isEqualTo("number");
    assertThat(fields.get("weight").dataType()).isEqualTo("number");
  }

  @Test
  void aRangeIsEditedAsItsTwoBounds() {
    var fields = fields();
    assertThat(fields.get("nights-from").dataType()).isEqualTo("integer");
    assertThat(fields.get("nights-to").dataType()).isEqualTo("integer");
  }

  @Test
  void theStereotypeComesFromRepresentationOrTheViewsSupplierElseItIsRegular() {
    var fields = fields();
    assertThat(fields.get("notes").stereotype()).isEqualTo("textarea");
    assertThat(fields.get("supplied").stereotype()).isEqualTo("richText");
    assertThat(fields.get("unsupplied").stereotype()).isEqualTo("regular");
  }
}
