package io.mateu.uidl.layout;

import static org.assertj.core.api.Assertions.assertThat;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Weight;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import org.junit.jupiter.api.Test;

/** How wide a column or filter is assumed to be (1u ≈ 76px) — what the layouts are chosen from. */
class WeightEstimatorTest {

  private final WeightEstimator estimator = new WeightEstimator();

  @SuppressWarnings("unused")
  static class Row {
    @Weight(1.25)
    String code;

    @ColumnWidth("152px")
    String name;

    @ColumnWidth("auto")
    String notes;

    String plain;
  }

  record RowRecord(@Weight(4) String image, String text) {}

  @Test
  void theStereotypeWinsOverTheDataType() {
    assertThat(estimator.base(FieldDataType.string, FieldStereotype.icon)).isEqualTo(1.0);
    assertThat(estimator.base(FieldDataType.string, FieldStereotype.select)).isEqualTo(2.0);
    assertThat(estimator.base(FieldDataType.string, FieldStereotype.link)).isEqualTo(2.5);
    assertThat(estimator.base(FieldDataType.string, FieldStereotype.image)).isEqualTo(4.0);
    assertThat(estimator.base(FieldDataType.string, FieldStereotype.richText)).isEqualTo(5.0);
    // a stereotype with no width of its own falls back to the data type
    assertThat(estimator.base(FieldDataType.bool, FieldStereotype.regular)).isEqualTo(1.0);
  }

  @Test
  void theDataTypeSetsTheWidthOtherwise() {
    assertThat(estimator.base(FieldDataType.bool, null)).isEqualTo(1.0);
    assertThat(estimator.base(FieldDataType.integer, null)).isEqualTo(1.5);
    assertThat(estimator.base(FieldDataType.money, null)).isEqualTo(2.0);
    assertThat(estimator.base(FieldDataType.dateTime, null)).isEqualTo(2.5);
    assertThat(estimator.base(FieldDataType.string, null)).isEqualTo(3.0);
    assertThat(estimator.base(null, null)).isEqualTo(3.0);
  }

  /** {@code @Weight} is taken as written; {@code @ColumnWidth} is converted from pixels. */
  @Test
  void aDeclaredWeightOrWidthWinsOverTheType() throws Exception {
    assertThat(estimator.estimate(Row.class.getDeclaredField("code"), FieldDataType.string, null))
        .isEqualTo(1.25);
    assertThat(estimator.estimate(Row.class.getDeclaredField("name"), FieldDataType.string, null))
        .isEqualTo(2.0);
    // "auto" is no pixel width: the assumed default
    assertThat(estimator.estimate(Row.class.getDeclaredField("notes"), FieldDataType.bool, null))
        .isEqualTo(3.0);
    assertThat(estimator.estimate(Row.class.getDeclaredField("plain"), FieldDataType.bool, null))
        .isEqualTo(1.0);
  }

  @Test
  void recordComponentsAreEstimatedTheSameWay() {
    var components = RowRecord.class.getRecordComponents();

    assertThat(estimator.estimate(components[0], FieldDataType.string, null)).isEqualTo(4.0);
    assertThat(estimator.estimate(components[1], FieldDataType.integer, null)).isEqualTo(1.5);
    assertThat(estimator.parsePx(" 38PX ")).isEqualTo(0.5);
    assertThat(estimator.parsePx(null)).isEqualTo(3.0);
  }
}
