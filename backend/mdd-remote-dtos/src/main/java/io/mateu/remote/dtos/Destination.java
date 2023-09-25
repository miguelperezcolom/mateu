package io.mateu.remote.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class Destination {

  private DestinationType type;

  private String description;

  private String value;
}
