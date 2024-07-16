package io.mateu.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@AllArgsConstructor
@NoArgsConstructor
public class Banner {
  private String theme;
  private Boolean hasIcon;
  private Boolean hasCloseButton;
  private String title;
  private String description;
}
