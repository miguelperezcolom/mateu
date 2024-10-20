package io.mateu.core.domain.uidefinition.shared.data;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import io.mateu.core.domain.model.reflection.fieldabstraction.Field;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class ChartData {

  private final Field field;

  private String title;

  private List<ChartValue> values = new ArrayList<>();

  public ChartData(Field field, String title, List<ChartValue> values) {
    this.field = field;
    this.title = title;
    this.values = values;
  }
}
