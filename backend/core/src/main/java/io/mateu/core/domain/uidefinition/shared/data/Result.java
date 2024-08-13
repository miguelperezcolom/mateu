package io.mateu.core.domain.uidefinition.shared.data;

import java.util.List;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuppressFBWarnings("EI_EXPOSE_REP2")
public class Result {

  private ResultType type;
  private String message;
  private List<Destination> interestingLinks;
  private Destination nowTo;
  private String leftSideImageUrl;
}
