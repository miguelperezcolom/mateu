package io.mateu.dtos;

import java.util.Map;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyCreationRq {

  private Map<String, Object> contextData;
}
