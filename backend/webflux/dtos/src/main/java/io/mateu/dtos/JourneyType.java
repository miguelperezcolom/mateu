package io.mateu.dtos;

import lombok.*;

@Data
@Builder
@NoArgsConstructor(access = AccessLevel.PACKAGE)
@AllArgsConstructor(access = AccessLevel.PACKAGE)
public class JourneyType {

  private String id;

  private String name;

  private String description;
}
