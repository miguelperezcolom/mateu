package io.mateu.mdd.shared.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

  private BadgeTheme theme;

  private String label;

  private String icon;

  private BadgeStyle badgeStyle;

  private BadgeIconPosition iconPosition;
}
