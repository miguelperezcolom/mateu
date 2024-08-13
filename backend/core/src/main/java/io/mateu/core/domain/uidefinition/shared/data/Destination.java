package io.mateu.core.domain.uidefinition.shared.data;

import edu.umd.cs.findbugs.annotations.SuppressFBWarnings;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@SuppressFBWarnings({"EI_EXPOSE_REP2", "EI_EXPOSE_REP"})
public class Destination {

  private DestinationType type;

  private String description;

  private String value;
}
