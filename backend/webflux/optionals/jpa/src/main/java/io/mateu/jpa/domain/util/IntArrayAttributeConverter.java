package io.mateu.jpa.domain.util;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/** Created by miguel on 12/10/16. */
@Converter(autoApply = true)
public class IntArrayAttributeConverter implements AttributeConverter<int[], String> {

  @Override
  public String convertToDatabaseColumn(int[] ints) {
    if (ints == null) return null;
    else {
      StringBuffer sb = new StringBuffer();
      for (int pos = 0; pos < ints.length; pos++) {
        if (pos > 0) sb.append(",");
        sb.append(ints[pos]);
      }
      return sb.toString();
    }
  }

  @Override
  public int[] convertToEntityAttribute(String s) {
    if (s == null) return null;
    else {
      if ("".equals(s)) return new int[0];
      String[] xs = s.split(",");
      int[] ints = new int[xs.length];
      for (int pos = 0; pos < xs.length; pos++) ints[pos] = Integer.parseInt(xs[pos]);
      return ints;
    }
  }
}
