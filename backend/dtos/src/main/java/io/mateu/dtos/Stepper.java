package io.mateu.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Stepper implements ViewMetadata {

  private final ViewMetadataType type = ViewMetadataType.Stepper;

  private String dataPrefix;
}
