package io.mateu.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyStarter implements ViewMetadata {

  private final ViewMetadataType type = ViewMetadataType.JourneyStarter;

  private String dataPrefix;
  private String baseUrl;
}
