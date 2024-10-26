package io.mateu.core.domain.uidefinitionlanguage.shared.data;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChartValue {

  private Object key;

  private String title;

  private double value;

  private String style;

  public ChartValue(Object key, String title, double value, String style) {
    this.key = key;
    this.title = title;
    this.value = value;
    this.style = style;
  }
}
