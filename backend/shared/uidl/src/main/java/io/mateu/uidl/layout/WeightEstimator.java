package io.mateu.uidl.layout;

import io.mateu.uidl.annotations.ColumnWidth;
import io.mateu.uidl.annotations.Weight;
import io.mateu.uidl.data.FieldDataType;
import io.mateu.uidl.data.FieldStereotype;
import java.lang.reflect.Field;
import java.lang.reflect.RecordComponent;

/**
 * Derives a display-width weight (1u ≈ 76px) for any column or filter field.
 *
 * <p>Stereotype checks take precedence over dataType checks so that, e.g., an image column always
 * gets 4u regardless of its declared dataType.
 */
public class WeightEstimator {

  static final double PX_PER_UNIT = 76.0;

  /**
   * Returns the base weight derived purely from type metadata, without inspecting annotations.
   * Weight table:
   *
   * <ul>
   *   <li>icon / bool → 1u
   *   <li>status / integer → 1.5u
   *   <li>combobox / select / number / date / money → 2u
   *   <li>link / dateTime / dateRange → 2.5u
   *   <li>string → 3u
   *   <li>image → 4u
   *   <li>html / richText / markdown / textarea → 5u
   * </ul>
   */
  public double base(FieldDataType dataType, FieldStereotype stereotype) {
    if (stereotype != null) {
      switch (stereotype) {
        case icon:
          return 1.0;
        case combobox:
        case select:
          return 2.0;
        case link:
          return 2.5;
        case image:
          return 4.0;
        case html:
        case richText:
        case markdown:
        case textarea:
          return 5.0;
        default:
          break;
      }
    }
    if (dataType == null) return 3.0;
    return switch (dataType) {
      case bool -> 1.0;
      case status, integer -> 1.5;
      case number, date, money -> 2.0;
      case dateTime, dateRange -> 2.5;
      default -> 3.0;
    };
  }

  /**
   * Estimates the weight for a Java {@link Field}, honouring {@link Weight} and {@link ColumnWidth}
   * annotations when present.
   */
  public double estimate(Field field, FieldDataType dataType, FieldStereotype stereotype) {
    Weight w = field.getAnnotation(Weight.class);
    if (w != null) return w.value();
    ColumnWidth cw = field.getAnnotation(ColumnWidth.class);
    if (cw != null) return parsePx(cw.value());
    return base(dataType, stereotype);
  }

  /**
   * Estimates the weight for a {@link RecordComponent}, honouring {@link Weight} and {@link
   * ColumnWidth} annotations when present.
   */
  public double estimate(
      RecordComponent component, FieldDataType dataType, FieldStereotype stereotype) {
    Weight w = component.getAnnotation(Weight.class);
    if (w != null) return w.value();
    ColumnWidth cw = component.getAnnotation(ColumnWidth.class);
    if (cw != null) return parsePx(cw.value());
    return base(dataType, stereotype);
  }

  double parsePx(String value) {
    if (value == null) return 3.0;
    String s = value.trim().toLowerCase().replace("px", "").trim();
    try {
      return Double.parseDouble(s) / PX_PER_UNIT;
    } catch (NumberFormatException e) {
      return 3.0;
    }
  }
}
