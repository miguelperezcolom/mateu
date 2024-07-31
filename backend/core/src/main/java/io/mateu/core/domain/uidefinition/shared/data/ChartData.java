package io.mateu.core.domain.uidefinition.shared.data;

import io.mateu.core.domain.model.reflection.FieldInterfaced;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChartData {

  private final FieldInterfaced field;

  private String title;

  private List<ChartValue> values = new ArrayList<>();

  public ChartData(FieldInterfaced field, String title, List<ChartValue> values) {
    this.field = field;
    this.title = title;
    this.values = values;
  }
}
