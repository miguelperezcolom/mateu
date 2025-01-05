package io.mateu.dtos;

import java.util.Collections;
import java.util.List;

public record UIDto(
    String favIcon,
    String icon,
    String logo,
    String title,
    String subtitle,
    List<MenuDto> menu,
    String homeJourneyTypeId,
    String loginUrl,
    String welcomeMessage,
    String logoutUrl,
    List<AppDto> apps) {

  public UIDto {
    menu = Collections.unmodifiableList(menu);
    apps = Collections.unmodifiableList(apps);
  }

  @Override
  public List<MenuDto> menu() {
    return Collections.unmodifiableList(menu);
  }

  @Override
  public List<AppDto> apps() {
    return Collections.unmodifiableList(apps);
  }
}
