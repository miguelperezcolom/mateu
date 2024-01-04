package io.mateu.remote.dtos;

import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class StepWrapper {

  Journey journey;

  Step step;

  Map<String, Object> store;
}
