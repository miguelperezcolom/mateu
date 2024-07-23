package io.mateu.dtos;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Tab {

  String id;

  boolean active;

  String caption;
}
