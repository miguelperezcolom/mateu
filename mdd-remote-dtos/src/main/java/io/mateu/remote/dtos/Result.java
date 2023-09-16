package io.mateu.remote.dtos;

import java.util.List;
import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Result implements ViewMetadata {

  private final ViewMetadataType type = ViewMetadataType.Result;

  private String dataPrefix;
  private ResultType resultType;
  private String message;
  private List<Destination> interestingLinks;
  private Destination nowTo;
}
