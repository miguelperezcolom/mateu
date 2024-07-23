package io.mateu.core.domain.uidefinition.shared.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class Banner {
  private BannerTheme theme;
  private Boolean hasIcon;
  private Boolean hasCloseButton;
  private String title;
  private String description;
}
