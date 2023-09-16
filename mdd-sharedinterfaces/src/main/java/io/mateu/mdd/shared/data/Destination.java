package io.mateu.mdd.shared.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Destination {

  private DestinationType type;

  private String description;

  private String value;
}
