package io.mateu.mdd.shared.data;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result {

  private ResultType type;
  private String message;
  private List<Destination> interestingLinks;
  private Destination nowTo;
}