package io.mateu.dtos;

import java.util.List;
import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Step {

  private String id;

  private String name;

  private String type;

  private View view;

  private Map<String, Object> data;

  private List<Rule> rules;

  private String previousStepId;

  private String target;

  public void mergeData(Map<String, Object> values) {
    if (values != null) {
      data.putAll(values);
    }
  }
}
