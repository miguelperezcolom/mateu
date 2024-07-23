package io.mateu.dtos;

import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class RunActionRq {

  private Map<String, Object> data;

  private Map<String, Object> journey;

  private Map<String, Object> contextData;
}
