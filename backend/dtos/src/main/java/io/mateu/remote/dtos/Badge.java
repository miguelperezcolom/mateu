package io.mateu.remote.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class Badge {

  private BadgeTheme theme;

  private String label;

  private String icon;

  private BadgeStyle badgeStyle;

  private BadgeIconPosition iconPosition;
}
